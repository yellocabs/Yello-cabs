import { COLORS } from '@/assets/colors';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { icons } from '@/constants';
import { useUserStore } from '@/store';
import CustomButton from '@/components/shared/custom-button';

const IllustrationImage = require('@/assets/images/Users.gif');

const RoleScreen = () => {
  const navigation = useNavigation<any>();
  const { setUser } = useUserStore();
  const { width, height } = useWindowDimensions();

  const [selectedRole, setSelectedRole] = useState<'rider' | 'captain' | null>(
    null,
  );

  const handleRoleSelect = (role: 'rider' | 'captain') => {
    setSelectedRole(role);
    setUser({ role });
  };

  const handleGetStarted = () => {
    if (selectedRole) {
      navigation.navigate('Login' as never);
    } else {
      Alert.alert('Error', 'Please select a role to get started.');
    }
  };

  // ...

  const RoleOption = ({
    role,

    icon,

    isSelected,

    onSelect,
  }: {
    role: 'rider' | 'captain';

    icon: any;

    isSelected: boolean;

    onSelect: (role: 'rider' | 'captain') => void;
  }) => {
    const roleName = role === 'rider' ? 'Rider' : 'Captain';

    const description =
      role === 'rider'
        ? 'Book quick and safe rides.'
        : 'Earn by driving your cab.';

    const baseClasses = 'rounded-3xl shadow-md items-center justify-between';

    const selectedClasses = `border-2 border-[${COLORS.PRIMARY[500]}] bg-[${COLORS.PRIMARY[100]}]`;

    const unselectedClasses = `border border-[${COLORS.GENERAL[300]}] bg-[${COLORS.BRAND_WHITE}]`;

    const textColor = isSelected
      ? `text-[${COLORS.BRAND_BLACK}]`
      : `text-[${COLORS.GENERAL[200]}]`;

    return (
      <TouchableOpacity
        style={{
          width: width * 0.4,

          paddingVertical: height * 0.02,

          paddingHorizontal: width * 0.04,
        }}
        className={`${baseClasses} ${
          isSelected ? selectedClasses : unselectedClasses
        }`}
        onPress={() => onSelect(role)}
        activeOpacity={0.9}
      >
        <View
          style={{
            width: width * 0.12,

            height: width * 0.12,

            marginBottom: height * 0.015,
          }}
          className={`rounded-2xl bg-[${COLORS.PRIMARY[100]}] items-center justify-center`}
        >
          <Image
            source={icon}
            style={{ width: width * 0.07, height: width * 0.07 }}
            resizeMode="contain"
          />
        </View>

        <Text
          className={`text-xl font-UrbanistSemiBold mb-1 ${textColor}`}
          style={{ fontSize: width * 0.05 }}
        >
          {roleName}
        </Text>

        <Text
          className={`text-xs text-center font-UrbanistMedium ${textColor}`}
          style={{ fontSize: width * 0.032 }}
        >
          {description}
        </Text>

        {isSelected && (
          <View
            style={{
              marginTop: height * 0.015,

              paddingVertical: height * 0.006,

              paddingHorizontal: width * 0.03,
            }}
            className={`rounded-full bg-[${COLORS.BRAND_WHITE}] self-center`}
          >
            <Text
              className={`text-[${COLORS.PRIMARY.DEFAULT}] font-UrbanistSemiBold`}
              style={{ fontSize: width * 0.03 }}
            >
              Selected
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.PRIMARY.DEFAULT }}>
      {/* Top Circle */}

      <View
        style={{
          width: width * 0.33,

          height: width * 0.33,

          top: -height * 0.08,

          right: -width * 0.1,

          backgroundColor: COLORS.PRIMARY[500],
        }}
        className="absolute rounded-full"
      />

      {/* Bottom Circle */}

      <View
        style={{
          width: width * 0.37,

          height: width * 0.37,

          bottom: -height * 0.1,

          left: -width * 0.12,

          backgroundColor: COLORS.PRIMARY[500],
        }}
        className="absolute rounded-full"
      />

      <View
        style={{
          paddingHorizontal: width * 0.06,

          paddingTop: height * 0.07,

          paddingBottom: height * 0.05,
        }}
        className="flex-1"
      >
        {/* Illustration */}

        <View style={{ marginBottom: height * 0.03 }} className="items-center">
          <Image
            source={IllustrationImage}
            resizeMode="contain"
            style={{
              width: width * 0.95,

              height: height * 0.15,

              marginBottom: height * 0.015,
            }}
          />
        </View>

        {/* Title */}

        <View style={{ marginBottom: height * 0.04 }}>
          <Text
            className="text-center text-brand-black font-bold"
            style={{
              fontSize: width * 0.095,

              lineHeight: width * 0.11,

              color: COLORS.BRAND_BLACK,
            }}
          >
            Choose your role
          </Text>

          <Text
            className="text-center font-UrbanistMedium"
            style={{
              fontSize: width * 0.042,

              marginTop: height * 0.01,

              paddingHorizontal: width * 0.03,

              color: COLORS.BRAND_WHITE,
            }}
          >
            Select{' '}
            <Text
              style={{ color: COLORS.BRAND_BLACK }}
              className="font-UrbanistSemiBold"
            >
              Captain
            </Text>{' '}
            if you want to drive, or{' '}
            <Text
              style={{ color: COLORS.BRAND_BLACK }}
              className="font-UrbanistSemiBold"
            >
              Rider
            </Text>{' '}
            if you want to travel.
          </Text>
        </View>

        {/* Role Card */}

        <View
          className="rounded-3xl shadow-lg"
          style={{
            paddingHorizontal: width * 0.05,

            paddingVertical: height * 0.03,

            marginBottom: height * 0.04,

            backgroundColor: COLORS.BRAND_WHITE,

            shadowColor: COLORS.GENERAL[300],
          }}
        >
          <Text
            className="font-UrbanistSemiBold"
            style={{
              fontSize: width * 0.04,

              marginBottom: height * 0.02,

              color: COLORS.BRAND_BLACK,
            }}
          >
            Continue as
          </Text>

          <View className="flex-row justify-between">
            <RoleOption
              role="rider"
              icon={icons.user}
              isSelected={selectedRole === 'rider'}
              onSelect={handleRoleSelect}
            />

            <RoleOption
              role="captain"
              icon={icons.driver}
              isSelected={selectedRole === 'captain'}
              onSelect={handleRoleSelect}
            />
          </View>
        </View>

        {/* Get Started */}

        <CustomButton
          title="Get started"
          onPress={handleGetStarted}
          bgVariant="primary"
          textVariant="default"
          rounded="2xl"
          height="h-14"
          className={`shadow-lg mt-2 ${!selectedRole ? 'opacity-50' : ''}`}
          disabled={!selectedRole}
          flex={false}
        />

        {/* Made in Bharat */}

        <View
          style={{
            bottom: height * 0.03,
          }}
          className="absolute left-0 right-0 flex-row justify-center items-center"
        >
          <View
            style={{
              paddingVertical: height * 0.006,

              paddingHorizontal: width * 0.04,

              backgroundColor: COLORS.BRAND_WHITE,
            }}
            className="flex-row items-center rounded-full shadow-sm"
          >
            <Image
              source={require('@/assets/icons/flag.png')}
              style={{ width: width * 0.05, height: width * 0.05 }}
              resizeMode="contain"
            />

            <Text
              className="font-UrbanistMedium"
              style={{
                fontSize: width * 0.03,

                marginLeft: width * 0.02,

                color: COLORS.GENERAL[200],
              }}
            >
              Made in Bharat
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default RoleScreen;
