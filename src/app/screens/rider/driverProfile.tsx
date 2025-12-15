import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  ScrollView,
  useColorScheme,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { useUserStore } from '@/store';
import CustomButton from '@/components/shared/custom-button';
import { COLORS } from '@/assets/colors';

const { width } = Dimensions.get('window');
const TOTAL_STEPS = 4;
const STORAGE_KEY = 'driver_profile_draft';

type ProfileData = {
  personalPhoto: any;
  firstName: string;
  lastName: string;
  dob: Date;
  licenseFront: any;
  licenseBack: any;
  selfieWithLicense: any;
  licenseNumber: string;
  licenseExpiry: Date;
  aadhaarFront: any;
  aadhaarBack: any;
  aadhaarNumber: string;
  vehiclePhoto: any;
  numberPlateFront: any;
  numberPlateBack: any;
  vehicleModel: string;
  vehicleColor: string;
};

const defaultProfile: ProfileData = {
  personalPhoto: null,
  firstName: '',
  lastName: '',
  dob: new Date(),
  licenseFront: null,
  licenseBack: null,
  selfieWithLicense: null,
  licenseNumber: '',
  licenseExpiry: new Date(),
  aadhaarFront: null,
  aadhaarBack: null,
  aadhaarNumber: '',
  vehiclePhoto: null,
  numberPlateFront: null,
  numberPlateBack: null,
  vehicleModel: '',
  vehicleColor: '',
};

const DriverProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { user, setUser } = useUserStore();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const styles = createStyles(isDark);

  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>(defaultProfile);
  const [showDatePicker, setShowDatePicker] = useState<{
    field: keyof ProfileData | null;
  }>({ field: null });

  /* ---------------- AUTO SAVE ---------------- */

  useEffect(() => {
    (async () => {
      const draft = await AsyncStorage.getItem(STORAGE_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        parsed.dob = new Date(parsed.dob);
        parsed.licenseExpiry = new Date(parsed.licenseExpiry);
        setProfileData(parsed);
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));
  }, [profileData]);

  /* ---------------- IMAGE PICK ---------------- */

  const pickImage = (field: keyof ProfileData, camera = false) => {
    const fn = camera ? launchCamera : launchImageLibrary;
    fn({ mediaType: 'photo', quality: 0.7 }, res => {
      if (!res.didCancel && res.assets?.[0]) {
        setProfileData(p => ({ ...p, [field]: res.assets![0] }));
      }
    });
  };

  /* ---------------- VALIDATION ---------------- */

  const isStepValid = () => {
    const p = profileData;
    switch (step) {
      case 1:
        return p.personalPhoto && p.firstName && p.lastName;
      case 2:
        return (
          p.licenseFront &&
          p.licenseBack &&
          p.selfieWithLicense &&
          p.licenseNumber
        );
      case 3:
        return p.aadhaarFront && p.aadhaarBack && p.aadhaarNumber.length === 12;
      case 4:
        return (
          p.vehiclePhoto &&
          p.numberPlateFront &&
          p.numberPlateBack &&
          p.vehicleModel
        );
      default:
        return false;
    }
  };

  /* ---------------- NAVIGATION ---------------- */

  const next = () => {
    if (step < TOTAL_STEPS) {
      setStep(s => s + 1);
    } else {
      submit();
    }
  };

  const submit = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser({ ...user, ...profileData, isProfileComplete: true });
    navigation.reset({
      index: 0,
      routes: [{ name: 'Driver', params: { screen: 'Home' } }],
    });
  };

  /* ---------------- UI ---------------- */

  const Progress = () => (
    <View style={styles.progress}>
      <View
        style={[
          styles.progressFill,
          { width: `${(step / TOTAL_STEPS) * 100}%` },
        ]}
      />
    </View>
  );

  const ImageBox = ({ label, field, count }: any) => (
    <>
      <Text style={styles.label}>
        {label} {count && <Text style={styles.count}>{count}</Text>}
      </Text>
      <TouchableOpacity
        style={styles.imageBox}
        onPress={() => pickImage(field)}
      >
        {profileData[field] ? (
          <Image
            source={{ uri: profileData[field].uri }}
            style={styles.image}
          />
        ) : (
          <Text style={styles.placeholder}>Tap to upload</Text>
        )}
      </TouchableOpacity>
    </>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.page}>
            <Text style={styles.title}>Personal Info</Text>
            <ImageBox label="Profile Photo" field="personalPhoto" />
            <TextInput
              style={styles.input}
              placeholder="First name"
              placeholderTextColor={styles.placeholder.color}
              value={profileData.firstName}
              onChangeText={t => setProfileData(p => ({ ...p, firstName: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Last name"
              placeholderTextColor={styles.placeholder.color}
              value={profileData.lastName}
              onChangeText={t => setProfileData(p => ({ ...p, lastName: t }))}
            />
          </View>
        );
      case 2:
        return (
          <View style={styles.page}>
            <Text style={styles.title}>License</Text>
            <ImageBox label="Front" field="licenseFront" count="1/3" />
            <ImageBox label="Back" field="licenseBack" count="2/3" />
            <ImageBox
              label="Selfie with license"
              field="selfieWithLicense"
              count="3/3"
            />
            <TextInput
              style={styles.input}
              placeholder="License number"
              placeholderTextColor={styles.placeholder.color}
              value={profileData.licenseNumber}
              onChangeText={t =>
                setProfileData(p => ({ ...p, licenseNumber: t }))
              }
            />
          </View>
        );
      case 3:
        return (
          <View style={styles.page}>
            <Text style={styles.title}>Aadhaar</Text>
            <ImageBox label="Front" field="aadhaarFront" count="1/2" />
            <ImageBox label="Back" field="aadhaarBack" count="2/2" />
            <TextInput
              style={styles.input}
              placeholder="Aadhaar number"
              keyboardType="number-pad"
              maxLength={12}
              placeholderTextColor={styles.placeholder.color}
              value={profileData.aadhaarNumber}
              onChangeText={t =>
                setProfileData(p => ({ ...p, aadhaarNumber: t }))
              }
            />
          </View>
        );
      case 4:
        return (
          <View style={styles.page}>
            <Text style={styles.title}>Vehicle</Text>
            <ImageBox label="Vehicle" field="vehiclePhoto" count="1/3" />
            <ImageBox
              label="Number plate front"
              field="numberPlateFront"
              count="2/3"
            />
            <ImageBox
              label="Number plate back"
              field="numberPlateBack"
              count="3/3"
            />
            <TextInput
              style={styles.input}
              placeholder="Vehicle model"
              placeholderTextColor={styles.placeholder.color}
              value={profileData.vehicleModel}
              onChangeText={t =>
                setProfileData(p => ({ ...p, vehicleModel: t }))
              }
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.step}>
            Step {step} of {TOTAL_STEPS}
          </Text>
          <Progress />
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {renderStepContent()}
        </ScrollView>

        <View style={styles.footer}>
          <CustomButton
            title={step === TOTAL_STEPS ? 'Submit' : 'Next'}
            disabled={!isStepValid()}
            onPress={next}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
const createStyles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: dark ? '#0B0B0B' : COLORS.GENERAL[50],
    },
    header: {
      padding: 16,
    },
    step: {
      color: dark ? '#AAA' : COLORS.TEXT.MUTED,
      marginBottom: 6,
    },
    progress: {
      height: 6,
      backgroundColor: dark ? '#222' : COLORS.GENERAL[100],
      borderRadius: 6,
    },
    progressFill: {
      height: '100%',
      backgroundColor: COLORS.PRIMARY.DEFAULT,
    },
    page: {
      width,
      padding: 16,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      marginBottom: 16,
      color: dark ? '#FFF' : COLORS.TEXT.DEFAULT,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 6,
      color: dark ? '#AAA' : COLORS.TEXT.MUTED,
    },
    count: {
      fontWeight: '400',
      fontSize: 12,
    },
    imageBox: {
      height: 130,
      borderRadius: 14,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: dark ? '#444' : COLORS.GENERAL[300],
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: 14,
    },
    input: {
      height: 52,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: dark ? '#333' : COLORS.GENERAL[200],
      paddingHorizontal: 16,
      color: dark ? '#FFF' : COLORS.TEXT.DEFAULT,
      marginBottom: 16,
    },
    placeholder: {
      color: dark ? '#666' : COLORS.TEXT.MUTED,
    },
    footer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: dark ? '#222' : COLORS.GENERAL[100],
    },
  });

export default DriverProfileScreen;
