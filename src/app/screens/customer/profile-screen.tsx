import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import React, { useState } from 'react';
import {
  ChevronRight,
  Edit2,
  LogOut,
  MapPin,
  Bell,
  CreditCard,
  Lock,
  Globe,
  Eye,
  Shield,
  HelpCircle,
  Users,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/store/auth-store';
import { useUserStore } from '@/store/use-user-store';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const ProfileScreen = () => {
  const { width, height } = useWindowDimensions();

  // Responsive values
  const avatarSize = width * 0.28;
  const nameFont = width * 0.06;
  const phoneFont = width * 0.042;
  const listItemHeight = height * 0.075;
  const iconSize = width * 0.06;

  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(false);
  const toggleDarkMode = () =>
    setIsDarkModeEnabled(previousState => !previousState);

  // ----- List Item Component -----
  const ProfileListItem = ({
    icon: Icon,
    title,
    value,
    onPress,
    isLogout = false,
    showChevron = true,
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: listItemHeight,
        paddingHorizontal: width * 0.04,
        borderBottomWidth: isLogout ? 0 : 1,
        borderColor: 'rgba(0,0,0,0.1)',
        marginTop: isLogout ? height * 0.02 : 0,
      }}
    >
      <Icon size={iconSize} color={isLogout ? '#ef4444' : '#000000'} />

      <Text
        style={{
          flex: 1,
          marginLeft: width * 0.04,
          fontSize: width * 0.045,
          color: isLogout ? '#ef4444' : '#333',
          fontWeight: isLogout ? '600' : '400',
        }}
      >
        {title}
      </Text>

      {value && (
        <Text
          style={{
            marginRight: width * 0.02,
            fontSize: width * 0.038,
            color: '#666',
          }}
        >
          {value}
        </Text>
      )}

      {showChevron && (
        <ChevronRight
          size={iconSize * 0.9}
          color={isLogout ? '#ef4444' : '#999'}
        />
      )}
    </TouchableOpacity>
  );

  // ----- Dark Mode Switch Item -----
  const DarkModeItem = ({ icon: Icon, title }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: listItemHeight,
        paddingHorizontal: width * 0.04,
        borderBottomWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
      }}
    >
      <Icon size={iconSize} color="#000" />

      <Text
        style={{
          flex: 1,
          marginLeft: width * 0.04,
          fontSize: width * 0.045,
          color: '#333',
        }}
      >
        {title}
      </Text>

      <Switch
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={isDarkModeEnabled ? '#007aff' : '#f4f3f4'}
        onValueChange={toggleDarkMode}
        value={isDarkModeEnabled}
      />
    </View>
  );
  const navigation = useNavigation();
  const { setToken } = useAuthStore();
  const { clearData } = useUserStore();

  const handleLogout = async (disconnect?: () => void) => {
    try {
      if (disconnect) {
        disconnect();
      }
      await AsyncStorage.removeItem('authToken');

      setToken(null);
      clearData();
      Toast.show({
        type: 'success',
        text1: 'Logged Out',
        text2: 'You have been logged out successfully 🎉',
        position: 'bottom',
        visibilityTime: 2000,
      });
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (err) {
      console.log('Logout error:', err);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'rgba(255, 235, 59, 0.2)' }}>
      {/* ----- PROFILE HEADER ----- */}
      <View style={{ alignItems: 'center', paddingVertical: height * 0.04 }}>
        <View
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
            backgroundColor: '#ccc',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1507003211169-0a812d8a7c29?q=80&w=100&auto=format&fit=crop',
            }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />

          {/* Edit Button */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              bottom: 4,
              right: 4,
              backgroundColor: '#fff',
              padding: 4,
              borderRadius: 20,
              elevation: 3,
            }}
          >
            <Edit2 size={iconSize * 0.7} color="#000" />
          </TouchableOpacity>
        </View>

        <Text
          style={{
            marginTop: height * 0.02,
            fontSize: nameFont,
            fontWeight: '700',
            color: '#333',
          }}
        >
          Andrew Ainsley
        </Text>

        <Text
          style={{
            marginTop: height * 0.005,
            fontSize: phoneFont,
            color: '#555',
          }}
        >
          +1 111 467 378 399
        </Text>
      </View>

      {/* ----- MENU CARD ----- */}
      <View
        style={{
          backgroundColor: 'white',
          marginHorizontal: width * 0.04,
          borderRadius: 12,
          elevation: 3,
        }}
      >
        <ProfileListItem icon={Edit2} title="Edit Profile" />
        <ProfileListItem icon={MapPin} title="Address" />
        <ProfileListItem icon={Bell} title="Notification" />
        <ProfileListItem icon={CreditCard} title="Payment" />
        <ProfileListItem icon={Lock} title="Security" />

        <ProfileListItem
          icon={Globe}
          title="Language"
          value="English (US)"
          showChevron={true}
        />

        <DarkModeItem icon={Eye} title="Dark Mode" />

        <ProfileListItem icon={Shield} title="Privacy Policy" />
        <ProfileListItem icon={HelpCircle} title="Help Center" />
        <ProfileListItem icon={Users} title="Invite Friends" />

        <ProfileListItem
          icon={LogOut}
          title="Logout"
          isLogout={true}
          showChevron={false}
          onPress={handleLogout}
        />
      </View>

      <View style={{ height: height * 0.12 }} />
    </ScrollView>
  );
};

export default ProfileScreen;
