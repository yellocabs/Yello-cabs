import React, { useEffect, useState } from 'react';
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import api from '@/api/axiosInstance'; // Assuming this is your configured axios instance

import { useUserStore } from '@/store';
import CustomButton from '@/components/shared/custom-button';
import { COLORS } from '@/assets/colors';

const { width } = Dimensions.get('window');
const TOTAL_STEPS = 4;
const STORAGE_KEY = 'driver_profile_draft';

// state for the form data
type ProfileData = {
  personalPhoto: string;
  firstName: string;
  lastName: string;
  dob: Date;
  licenseFront: string;
  licenseBack: string;
  selfieWithLicense: string;
  licenseNumber: string;
  licenseExpiry: Date;
  aadhaarFront: string;
  aadhaarBack: string;
  aadhaarNumber: string;
  vehiclePhoto: string;
  numberPlateFront: string;
  numberPlateBack: string;
  vehicleModel: string;
  numberPlate: string;
  vehicleColor: string;
  vehicleYear: string;
};

// state for upload status of each image
type UploadStatus = { loading: boolean; error: string | null };
type Uploads = Record<
  keyof Omit<
    ProfileData,
    | 'firstName'
    | 'lastName'
    | 'dob'
    | 'licenseNumber'
    | 'licenseExpiry'
    | 'aadhaarNumber'
    | 'vehicleModel'
    | 'numberPlate'
    | 'vehicleColor'
    | 'vehicleYear'
  >,
  UploadStatus
>;

const DriverProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { user, setUser } = useUserStore();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const styles = createStyles(isDark);

  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>({
    personalPhoto: '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    dob: new Date(),
    licenseFront: '',
    licenseBack: '',
    selfieWithLicense: '',
    licenseNumber: '',
    licenseExpiry: new Date(),
    aadhaarFront: '',
    aadhaarBack: '',
    aadhaarNumber: '',
    vehiclePhoto: '',
    numberPlateFront: '',
    numberPlateBack: '',
    vehicleModel: '',
    numberPlate: '',
    vehicleColor: '',
    vehicleYear: '',
  });
  const [uploads, setUploads] = useState<Uploads>(() => ({}) as Uploads);
  const [showDatePicker, setShowDatePicker] = useState<{
    field: 'dob' | 'licenseExpiry' | null;
  }>({ field: null });

  const requestPermissions = async (camera: boolean) => {
    if (Platform.OS !== 'android') {
      return true;
    }
    try {
      let permission;
      let title;
      let message;

      if (camera) {
        permission = PermissionsAndroid.PERMISSIONS.CAMERA;
        title = 'Camera Permission';
        message = 'This app needs access to your camera.';
      } else {
        permission =
          Platform.Version >= 33
            ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
            : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        title = 'Storage Permission';
        message = 'This app needs access to your photo library.';
      }

      const granted = await PermissionsAndroid.request(permission, {
        title,
        message,
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      });

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Permission granted');
        return true;
      } else {
        Alert.alert(
          'Permission Denied',
          'You need to grant permission to upload images.',
        );
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const uploadImage = async (
    field: keyof typeof uploads,
    imageType: string,
    camera = false,
  ) => {
    const hasPermission = await requestPermissions(camera);
    if (!hasPermission) return;

    const fn = camera ? launchCamera : launchImageLibrary;
    fn({ mediaType: 'photo', quality: 0.7 }, async res => {
      if (res.didCancel || !res.assets?.[0]) return;

      const imageAsset = res.assets[0];
      setUploads(p => ({ ...p, [field]: { loading: true, error: null } }));

      try {
        const formData = new FormData();
        formData.append('image', {
          uri: imageAsset.uri,
          name: imageAsset.fileName,
          type: imageAsset.type,
        });
        formData.append('imageType', imageType);

        const response = await api.post('/api/users/files/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log(response.data.data.path);
        if (response.data?.data?.path) {
          setProfileData(p => ({ ...p, [field]: response.data.path }));
          setUploads(p => ({ ...p, [field]: { loading: false, error: null } }));
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Image upload error:', error);
        setUploads(p => ({
          ...p,
          [field]: { loading: false, error: 'Upload failed' },
        }));
      }
    });
  };
  const isStepValid = () => {
    const p = profileData;
    const isUploading = Object.values(uploads).some(u => u.loading);
    if (isUploading) return false;

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
          p.vehicleModel &&
          p.numberPlate &&
          p.vehicleYear
        );
      default:
        return false;
    }
  };

  const next = () => {
    if (step < TOTAL_STEPS) setStep(s => s + 1);
    else submit();
  };

  const submit = async () => {
    try {
      const payload = {
        dlNumber: profileData.licenseNumber,
        aadharNumber: profileData.aadhaarNumber,
        documents: {
          personalPhoto: profileData.personalPhoto,
          aadharFront: profileData.aadhaarFront,
          aadharBack: profileData.aadhaarBack,
          licenseFront: profileData.licenseFront,
          licenseBack: profileData.licenseBack,
          selfieWithLicense: profileData.selfieWithLicense,
        },
        vehicles: [
          {
            modelId: 1, // Placeholder
            numberPlate: profileData.numberPlate,
            color: profileData.vehicleColor,
            year: parseInt(profileData.vehicleYear, 10),
            images: {
              vehiclePhoto: profileData.vehiclePhoto,
              numberPlateFront: profileData.numberPlateFront,
              numberPlateBack: profileData.numberPlateBack,
            },
          },
        ],
        referredBy: 0, // Placeholder
      };
      // await api.post('/api/riders/register', payload);
      setUser({ ...user, ...profileData, isProfileComplete: true });
      navigation.reset({
        index: 0,
        routes: [{ name: 'Driver', params: { screen: 'Home' } }],
      });
    } catch (error) {
      console.error('Registration submission error:', error);
      Alert.alert(
        'Submission Failed',
        'Could not submit your registration. Please try again.',
      );
    }
  };

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

  const ImageBox = ({ label, field, imageType, camera, count }: any) => {
    const status = uploads[field] || { loading: false, error: null };
    return (
      <>
        <Text style={styles.label}>
          {label} {count && <Text style={styles.count}>{count}</Text>}
        </Text>
        <TouchableOpacity
          style={styles.imageBox}
          onPress={() => uploadImage(field, imageType, camera)}
        >
          {status.loading ? (
            <ActivityIndicator />
          ) : profileData[field] ? (
            <Image source={{ uri: profileData[field] }} style={styles.image} />
          ) : status.error ? (
            <Text style={{ color: 'red' }}>{status.error}</Text>
          ) : (
            <Text style={styles.placeholder}>Tap to upload</Text>
          )}
        </TouchableOpacity>
      </>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.page}>
            <Text style={styles.title}>Personal Info</Text>
            <ImageBox
              label="Profile Photo"
              field="personalPhoto"
              imageType="personal-photo"
              camera={true}
            />
            <TextInput
              style={styles.input}
              placeholder="First name"
              value={profileData.firstName}
              onChangeText={t => setProfileData(p => ({ ...p, firstName: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Last name"
              value={profileData.lastName}
              onChangeText={t => setProfileData(p => ({ ...p, lastName: t }))}
            />
            <TouchableOpacity
              onPress={() => setShowDatePicker({ field: 'dob' })}
              style={styles.input}
            >
              <Text>{profileData.dob.toDateString()}</Text>
            </TouchableOpacity>
          </View>
        );
      case 2:
        return (
          <View style={styles.page}>
            <Text style={styles.title}>Driver License</Text>
            <ImageBox
              label="License Front"
              field="licenseFront"
              imageType="license-front"
              count="1/3"
            />
            <ImageBox
              label="License Back"
              field="licenseBack"
              imageType="license-back"
              count="2/3"
            />
            <ImageBox
              label="Selfie with License"
              field="selfieWithLicense"
              imageType="selfie-with-license"
              camera={true}
              count="3/3"
            />
            <TextInput
              style={styles.input}
              placeholder="License Number"
              value={profileData.licenseNumber}
              onChangeText={t =>
                setProfileData(p => ({ ...p, licenseNumber: t }))
              }
            />
            <TouchableOpacity
              onPress={() => setShowDatePicker({ field: 'licenseExpiry' })}
              style={styles.input}
            >
              <Text>{profileData.licenseExpiry.toDateString()}</Text>
            </TouchableOpacity>
          </View>
        );
      case 3:
        return (
          <View style={styles.page}>
            <Text style={styles.title}>Aadhaar Verification</Text>
            <ImageBox
              label="Aadhaar Front"
              field="aadhaarFront"
              imageType="aadhar-front"
              count="1/2"
            />
            <ImageBox
              label="Aadhaar Back"
              field="aadhaarBack"
              imageType="aadhar-back"
              count="2/2"
            />
            <TextInput
              style={styles.input}
              placeholder="Aadhaar Number"
              keyboardType="number-pad"
              maxLength={12}
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
            <Text style={styles.title}>Vehicle Details</Text>
            <ImageBox
              label="Vehicle Photo"
              field="vehiclePhoto"
              imageType="vehicle-photo"
              count="1/3"
            />
            <ImageBox
              label="Front Number Plate"
              field="numberPlateFront"
              imageType="number-plate-front"
              count="2/3"
            />
            <ImageBox
              label="Back Number Plate"
              field="numberPlateBack"
              imageType="number-plate-back"
              count="3/3"
            />
            <TextInput
              style={styles.input}
              placeholder="Vehicle Model"
              value={profileData.vehicleModel}
              onChangeText={t =>
                setProfileData(p => ({ ...p, vehicleModel: t }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Vehicle Color"
              value={profileData.vehicleColor}
              onChangeText={t =>
                setProfileData(p => ({ ...p, vehicleColor: t }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Number Plate"
              value={profileData.numberPlate}
              onChangeText={t =>
                setProfileData(p => ({ ...p, numberPlate: t }))
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Vehicle Year"
              keyboardType="number-pad"
              value={profileData.vehicleYear}
              onChangeText={t =>
                setProfileData(p => ({ ...p, vehicleYear: t }))
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
            // disabled={!isStepValid()}
            onPress={next}
          />
        </View>
      </KeyboardAvoidingView>
      {showDatePicker.field && (
        <DateTimePicker
          value={profileData[showDatePicker.field]}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            const field = showDatePicker.field;
            setShowDatePicker({ field: null });
            if (selectedDate && field) {
              setProfileData(prev => ({ ...prev, [field]: selectedDate }));
            }
          }}
        />
      )}
    </SafeAreaView>
  );
};
// Styles remain largely the same, but I'll paste them for completeness
const createStyles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: dark ? '#0B0B0B' : COLORS.GENERAL[50],
    },
    header: { padding: 16 },
    step: { color: dark ? '#AAA' : COLORS.TEXT.MUTED, marginBottom: 6 },
    progress: {
      height: 6,
      backgroundColor: dark ? '#222' : COLORS.GENERAL[100],
      borderRadius: 6,
    },
    progressFill: { height: '100%', backgroundColor: COLORS.PRIMARY.DEFAULT },
    page: { width, padding: 16 },
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
    count: { fontWeight: '400', fontSize: 12 },
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
    image: { width: '100%', height: '100%', borderRadius: 14 },
    input: {
      height: 52,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: dark ? '#333' : COLORS.GENERAL[200],
      paddingHorizontal: 16,
      color: dark ? '#FFF' : COLORS.TEXT.DEFAULT,
      marginBottom: 16,
      justifyContent: 'center',
    },
    placeholder: { color: dark ? '#666' : COLORS.TEXT.MUTED },
    footer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: dark ? '#222' : COLORS.GENERAL[100],
    },
  });

export default DriverProfileScreen;
