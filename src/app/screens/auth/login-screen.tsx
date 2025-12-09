import { icons, images } from '@/constants';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TextStyle,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { ReactNativeModal } from 'react-native-modal';
import OTPInput from 'react-native-otp-textinput';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '@/store/use-user-store';
import { googleLogin } from '@/services/google-auth';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/store/auth-store';
import Config from 'react-native-config';
import { sendOtp, verifyOtp } from '@/api/end-points/auth';
import CustomButton from '@/components/shared/custom-button';
import GoogleLoginButton from '@/components/shared/google-login-button';
import {
  getHash,
  removeListener,
  startOtpListener,
} from 'react-native-otp-verify';
import ErrorModal from '@/components/shared/error-modal';

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const { height, width } = useWindowDimensions();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [phone, setPhone] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useUserStore();
  const { setToken } = useAuthStore();
  const rootNav = navigation.getParent();

  const [verification, setVerification] = useState({
    state: 'default' as 'default' | 'pending' | 'success',
    error: '',
    code: '',
  });
  const [otpKey, setOtpKey] = useState(0);
  const [countdown, setCountdown] = useState(0);

  // This useEffect handles the resend timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [countdown]);

  // This useEffect handles the OTP listener
  useEffect(() => {
    // Get the app hash for Android
    if (Platform.OS === 'android') {
      getHash()
        .then(hash => {
          console.log('Use this hash for your SMS message on Android:', hash);
        })
        .catch(console.log);
    }

    // Start the listener
    startOtpListener(message => {
      // Extract the OTP from the message
      try {
        const otp = /(\d{4})/g.exec(message)?.[1];
        if (otp) {
          setVerification(prev => ({ ...prev, code: otp }));
          setOtpKey(k => k + 1); // Change key to force re-render
        }
      } catch (error) {
        console.log('Error parsing OTP message:', error);
      }
    });

    // Cleanup on unmount
    return () => {
      removeListener();
    };
  }, []);

  // This useEffect handles the automatic submission
  useEffect(() => {
    if (verification.code.length === 4 && verification.state === 'pending') {
      onPressVerify();
    }
  }, [verification.code, verification.state]);

  const [errorState, setErrorState] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const showError = (title: string, message: string) => {
    setErrorState({
      visible: true,
      title,
      message,
    });
  };

  const hideError = () => {
    setErrorState({
      visible: false,
      title: '',
      message: '',
    });
  };

  const onPressVerify = async () => {
    const otp = verification.code?.toString().trim();

    if (!otp || otp.length !== 4) {
      showError('Invalid OTP', 'Please enter the 4-digit code.');
      return;
    }

    try {
      setLoading(true);

      const response = await verifyOtp(phone, otp, user?.role);
      const token = response.data?.data?.token;
      const responseUser = response.data?.data?.user;

      console.log(response);

      if (token) {
        await AsyncStorage.setItem('authToken', token);
        console.log(token);
        setToken(token);
      }
      if (responseUser) {
        setUser(responseUser);
      }

      setVerification(prev => ({
        ...prev,
        state: 'success',
      }));
    } catch (error: any) {
      console.log('Verify OTP Error:', error);
      showError(
        'OTP Verification Failed',
        error?.response?.data?.message || 'Invalid OTP. Try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const onResendOtp = () => {
    if (countdown > 0) return;
    onSignUpPress();
  };

  const onSignUpPress = async () => {
    if (loading) return;
    if (!phone || phone.length !== 10) {
      showError(
        'Invalid phone number',
        'Phone number must be exactly 10 digits. Please double-check and try again.',
      );
      return;
    }
    try {
      setLoading(true);
      const response = await sendOtp(phone);
      console.log(response);
      if (response.data?.success) {
        setVerification({
          code: '', // Clear previous OTP
          error: '',
          state: 'pending',
        });
        setOtpKey(k => k + 1); // Reset OTP input visual
        setCountdown(30); // Start timer
      } else {
        showError(
          'Error sending OTP',
          response.data?.message || 'Something went wrong.',
        );
      }
    } catch (error: any) {
      console.log('Send OTP Error:', error);
      showError(
        'Error sending OTP',
        error?.response?.data?.message || 'Something went wrong.',
      );
    } finally {
      setLoading(false);
    }
  };

  const onHome = () => {
    if (user?.role === 'captain') {
      rootNav?.reset({
        index: 0,
        routes: [{ name: 'Driver', params: { screen: 'Home' } }],
      });
    } else {
      rootNav?.reset({
        index: 0,
        routes: [{ name: 'Tabs', params: { screen: 'Home' } }],
      });
    }
  };

  const handleGoogleLogin = async () => {
    // setLoading(true);
    try {
      const response = await googleLogin(); // Google sign-in
      if (!response.ok || !response.data) {
        showError(
          'Google Sign-In Failed',
          'Something went wrong while signing in with Google. Please try again.',
        );
        return;
      }
      const { idToken } = response.data;
      console.log(response);

      if (idToken) {
        const backendResponse = await axios.post(
          `${Config.BASE_URL || 'http://localhost:8000'}/google-login`,
          {
            idToken: idToken,
          },
        );

        const data = backendResponse.data;
        // console.log('Backend Response:', data);

        if (data?.token) {
          await AsyncStorage.setItem('authToken', data.token);
          setToken(data.token);
        }
        if (data?.user) {
          setUser(data.user);
        }
      }
    } catch (error) {
      console.log('Login Error:', error);
      showError(
        'Google Sign-In Failed',
        'Something went wrong while signing in with Google. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Role', user?.role);
    console.log('BASE_URL:', Config.BASE_URL);
  }, []);

  /**
   * Responsive helpers (R1 style)
   * Use inline multipliers so UI scales predictably.
   *
   * NOTE: tweak the multipliers if you want slightly larger/smaller sizes.
   */
  const H = height;
  const W = width;

  const styles = StyleSheet.create({
    outerShapeTop: {
      position: 'absolute',
      top: -H * 0.02,
      right: -W * 0.02,
      width: W * 0.22,
      height: W * 0.22,
      borderRadius: (W * 0.22) / 2,
      backgroundColor: '#FDE9B3', // matches primary-200
      opacity: 0.8,
    },
    outerShapeBottom: {
      position: 'absolute',
      bottom: -H * 0.03,
      left: -W * 0.02,
      width: W * 0.22,
      height: W * 0.22,
      borderRadius: (W * 0.22) / 2,
      backgroundColor: '#FFDAB3', // matches brand-accent
      opacity: 0.8,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: W * 0.03,
      paddingVertical: H * 0.012,
      borderRadius: 999,
      backgroundColor: '#ffffff',
      shadowColor: '#000',
      shadowOpacity: 0.03,
      shadowRadius: 6,
      elevation: 1,
      marginBottom: H * 0.02,
    },
    badgeIconWrapper: {
      width: W * 0.082,
      height: W * 0.082,
      borderRadius: (W * 0.082) / 2,
      backgroundColor: '#f0bd1a',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: W * 0.02,
    },
    heading: {
      fontSize: Math.round(W * 0.075), // approx text-3xl
      lineHeight: Math.round(W * 0.09),
      textAlign: 'center',
      marginBottom: H * 0.005,
    },
    subheading: {
      fontSize: Math.round(W * 0.038), // approx text-base
      textAlign: 'center',
      marginBottom: H * 0.02,
    },
    card: {
      width: '100%',
      backgroundColor: '#ffffff',
      borderRadius: W * 0.06,
      paddingHorizontal: W * 0.04,
      paddingVertical: H * 0.025,
      shadowColor: '#000',
      shadowOpacity: 0.03,
      shadowRadius: 8,
      elevation: 1,
      marginBottom: H * 0.02,
    },
    phoneRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E6E9F0',
      borderRadius: W * 0.04,
      backgroundColor: '#ffffff',
      height: Math.max(H * 0.065, 48), // keeps it readable on small devices
    },
    countryWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: W * 0.03,
      borderRightWidth: 1,
      borderRightColor: '#E6E9F0',
    },
    phoneInput: {
      flex: 1,
      fontSize: Math.round(W * 0.042),
      paddingHorizontal: W * 0.03,
      color: '#111827',
    },
    sendOtpBtnWrapper: {
      marginTop: H * 0.015,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      marginVertical: H * 0.02,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: '#E6E9F0',
    },
    dividerText: {
      marginHorizontal: W * 0.02,
      fontSize: Math.round(W * 0.035),
    },
    otpModalContainer: {
      backgroundColor: '#fff',
      paddingHorizontal: W * 0.07,
      paddingVertical: H * 0.038,
      borderRadius: W * 0.06,
    },
    otpInputStyle: {
      borderWidth: 1,
      borderColor: '#CED1DD',
      borderRadius: 12,
      minWidth: Math.max(W * 0.11, 40),
      height: Math.max(H * 0.07, 48),
      fontFamily: 'Urbanist-Medium',
      fontSize: Math.round(W * 0.045),
      textAlign: 'center',
    } as TextStyle,
    successModalImage: {
      width: Math.max(W * 0.28, 90),
      height: Math.max(W * 0.28, 90),
      marginVertical: H * 0.02,
    },
    successModalContainer: {
      backgroundColor: '#fff',
      paddingHorizontal: W * 0.07,
      paddingVertical: H * 0.038,
      borderRadius: W * 0.06,
      alignItems: 'center',
    },
    bottomHelperText: {
      marginTop: H * 0.02,
    },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7FAFC' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1 bg-primary-100"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: H * 0.03 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Decorative shapes (responsive) */}
          <View style={styles.outerShapeTop} />
          <View style={styles.outerShapeBottom} />

          <View
            style={{
              flex: 1,
              paddingHorizontal: W * 0.04,
              paddingTop: H * 0.04,
              paddingBottom: H * 0.02,
              justifyContent: 'space-between',
            }}
          >
            {/* Top Section */}
            <View style={{ alignItems: 'center' }}>
              {/* Brand Badge */}
              <View style={styles.badge}>
                <View style={styles.badgeIconWrapper}>
                  <Image
                    source={icons.taxi}
                    style={{
                      width: W * 0.05,
                      height: W * 0.05,
                      resizeMode: 'contain',
                    }}
                  />
                </View>
                <Text
                  style={{
                    fontSize: Math.round(W * 0.045),
                    fontFamily: 'UrbanistSemiBold',
                    color: '#111827',
                  }}
                >
                  YelloCabs
                </Text>
              </View>

              {/* Headings */}
              <Text
                style={[
                  styles.heading,
                  { fontFamily: 'UrbanistExtraBold', color: '#111827' },
                ]}
              >
                Sign in to your account
              </Text>
              <Text
                style={[
                  styles.subheading,
                  { fontFamily: 'UrbanistMedium', color: '#6B7280' },
                ]}
              >
                Enter your phone number to continue booking rides.
              </Text>

              {/* Card */}
              <View style={styles.card}>
                {/* Phone Number Field */}
                <View style={{ width: '100%', marginBottom: H * 0.02 }}>
                  <Text
                    style={{
                      fontSize: Math.round(W * 0.038),
                      fontFamily: 'UrbanistSemiBold',
                      color: '#111827',
                      marginBottom: H * 0.01,
                    }}
                  >
                    Phone Number
                  </Text>

                  <View style={styles.phoneRow}>
                    <View style={styles.countryWrapper}>
                      <Text
                        style={{
                          fontSize: Math.round(W * 0.05),
                          marginRight: W * 0.02,
                        }}
                      >
                        🇮🇳
                      </Text>
                      <Text
                        style={{
                          fontSize: Math.round(W * 0.038),
                          fontFamily: 'UrbanistMedium',
                          color: '#111827',
                          marginRight: W * 0.02,
                        }}
                      >
                        +91
                      </Text>
                    </View>

                    <TextInput
                      style={styles.phoneInput}
                      placeholder="Enter mobile number"
                      keyboardType="number-pad"
                      placeholderTextColor="#858585"
                      maxLength={10}
                      onChangeText={setPhone}
                      value={phone}
                    />
                  </View>

                  <Text
                    style={{
                      marginTop: H * 0.008,
                      fontSize: Math.round(W * 0.032),
                      color: '#9CA3AF',
                      fontFamily: 'UrbanistLight',
                    }}
                  >
                    We’ll send a one-time password (OTP) to this number.
                  </Text>
                </View>

                <View style={styles.sendOtpBtnWrapper}>
                  <CustomButton
                    title="Send OTP"
                    onPress={onSignUpPress}
                    className="w-full bg-primary-500 rounded-2xl shadow-none"
                    style={{ height: Math.max(H * 0.07, 52) }}
                    textVariant="default"
                    loading={loading}
                  />
                </View>
              </View>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text
                  style={[
                    styles.dividerText,
                    { fontFamily: 'UrbanistMedium', color: '#9CA3AF' },
                  ]}
                >
                  or continue with
                </Text>
                <View style={styles.dividerLine} />
              </View>

              <GoogleLoginButton onPress={handleGoogleLogin} />
            </View>

            {/* Bottom helper text */}
            <View style={[styles.bottomHelperText, { alignItems: 'center' }]}>
              <Text
                style={{
                  fontSize: Math.round(W * 0.03),
                  fontFamily: 'UrbanistLight',
                  color: '#9CA3AF',
                  textAlign: 'center',
                }}
              >
                By continuing, you agree to our{' '}
                <Text
                  style={{ fontFamily: 'UrbanistMedium', color: '#111827' }}
                >
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text
                  style={{ fontFamily: 'UrbanistMedium', color: '#111827' }}
                >
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>

            {/* OTP + Success modals are outside scroll for better UX */}
          </View>
        </ScrollView>

        {/* OTP Modal */}
        <ReactNativeModal
          isVisible={verification.state === 'pending'}
          onBackdropPress={() =>
            setVerification(prev => ({ ...prev, state: 'default' }))
          }
          onModalHide={() => {
            if (verification.state === 'success') {
              setShowSuccessModal(true);
            }
          }}
          useNativeDriver
          hideModalContentWhileAnimating
        >
          <View style={styles.otpModalContainer}>
            <Text
              style={{
                fontFamily: 'UrbanistExtraBold',
                fontSize: Math.round(W * 0.055),
                marginBottom: H * 0.008,
                color: '#111827',
              }}
            >
              Verify OTP
            </Text>
            <Text
              style={{
                marginBottom: H * 0.02,
                color: '#6B7280',
                fontFamily: 'UrbanistMedium',
              }}
            >
              We’ve sent a 4-digit code to{' '}
              <Text
                style={{ fontFamily: 'UrbanistSemiBold', color: '#111827' }}
              >
                +91 {phone || 'your number'}
              </Text>
              .
            </Text>

            <OTPInput
              key={otpKey}
              defaultValue={verification.code}
              inputCount={4}
              handleTextChange={code =>
                setVerification(prev => ({ ...prev, code, error: '' }))
              }
              textInputStyle={styles.otpInputStyle}
              containerStyle={{
                marginBottom: H * 0.01,
                justifyContent: 'space-between',
              }}
              keyboardType="number-pad"
              tintColor="#FDB726"
            />

            <CustomButton
              title="Verify"
              onPress={onPressVerify}
              className="mt-6 bg-primary-500 rounded-2xl"
              style={{ marginTop: H * 0.02, height: Math.max(H * 0.07, 52) }}
              loading={loading}
            />

            <TouchableOpacity
              disabled={countdown > 0}
              onPress={onResendOtp}
              style={{
                marginTop: H * 0.015,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: Math.round(W * 0.033),
                  color: '#6B7280',
                  fontFamily: 'UrbanistMedium',
                }}
              >
                Didn’t receive the code?{' '}
                <Text
                  style={{
                    color: countdown > 0 ? '#9CA3AF' : '#111827',
                    fontFamily: 'UrbanistSemiBold',
                  }}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ReactNativeModal>

        {/* Success Modal */}
        <ReactNativeModal
          isVisible={showSuccessModal}
          useNativeDriver
          hideModalContentWhileAnimating
        >
          <View style={styles.successModalContainer}>
            <Image
              source={images.check}
              style={styles.successModalImage}
              resizeMode="contain"
            />
            <Text
              style={{
                fontSize: Math.round(W * 0.06),
                fontFamily: 'UrbanistExtraBold',
                textAlign: 'center',
                color: '#111827',
              }}
            >
              Verified
            </Text>
            <Text
              style={{
                fontSize: Math.round(W * 0.036),
                color: '#6B7280',
                textAlign: 'center',
                marginTop: H * 0.01,
                fontFamily: 'UrbanistMedium',
              }}
            >
              Your phone number has been successfully verified.
            </Text>

            <CustomButton
              title="Browse Home"
              loading={loading}
              onPress={() => {
                setShowSuccessModal(false);
                onHome();
              }}
              className="mt-6 w-full rounded-2xl bg-primary-500"
              style={{
                marginTop: H * 0.02,
                width: '100%',
                height: Math.max(H * 0.07, 52),
              }}
            />
          </View>
        </ReactNativeModal>

        <ErrorModal
          isVisible={errorState.visible}
          title={errorState.title}
          message={errorState.message}
          onClose={hideError}
          primaryLabel="OK"
          secondaryLabel="Close"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
