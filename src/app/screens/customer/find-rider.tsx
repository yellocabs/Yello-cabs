// src/app/screens/customer/find-rider.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
  Dimensions,
  Image,
  SafeAreaView,
  BackHandler,
  GestureResponderEvent,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

import NoDriverFoundModal from '@/components/shared/no-driver-found-modal';
import { useUserStore } from '@/store';
import { COLORS } from '@/assets/colors';
import RideLayout from '@/components/customer/ride-layout';
import { icons } from '@/constants';

// === Responsive utils ===
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

type RouteParams = {
  ride?: any;
  isAutoAccept?: boolean;
};

const FindRiderScreen: React.FC<any> = ({ route, navigation }) => {
  const params = (route?.params || {}) as RouteParams;
  const rideFareFromParams = Number(params?.ride?.data?.ride?.fair ?? 0);

  const { location, destination, setDestination } = useUserStore();

  const [currentFare, setCurrentFare] = useState<number>(rideFareFromParams);
  const [isAutoAcceptEnabled, setIsAutoAcceptEnabled] = useState<boolean>(
    !!params.isAutoAccept,
  );

  // Timer
  const TOTAL_TIME = 20;
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_TIME);
  const timerRef = useRef<number | null>(null);

  // Modal states
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [showNoDriverModal, setShowNoDriverModal] = useState<boolean>(false);

  // Reanimated shared values for modal animation
  const cancelModalAnim = useSharedValue(0); // 0 hidden, 1 visible
  const noDriverModalAnim = useSharedValue(0);

  // animate when visible changes
  useEffect(() => {
    cancelModalAnim.value = withTiming(showCancelModal ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [showCancelModal]);

  useEffect(() => {
    noDriverModalAnim.value = withTiming(showNoDriverModal ? 1 : 0, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [showNoDriverModal]);

  // Animated styles
  const modalOverlayStyle = useAnimatedStyle(() => ({
    opacity: Math.max(cancelModalAnim.value, noDriverModalAnim.value) * 1.0,
  }));

  const modalBoxStyle = useAnimatedStyle(() => {
    // choose scale/opactiy from whichever modal is visible (priority: cancel then nodriver)
    const v = Math.max(cancelModalAnim.value, noDriverModalAnim.value);
    return {
      transform: [{ scale: 0.96 + 0.04 * v }],
      opacity: v,
      translateY: (1 - v) * 8,
    };
  });

  // === Timer handling ===
  useEffect(() => {
    // start timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000) as unknown as number;

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when timer reaches 0, show NoDriver modal and stop timer
  useEffect(() => {
    if (timeLeft <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // show custom modal instead of Alert
      setShowNoDriverModal(true);
    }
  }, [timeLeft]);

  // Format time mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.max(0, sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // === Back handling: Android hardware + navigation (iOS swipe/back)
  const openCancelModal = useCallback(() => {
    setShowCancelModal(true);
  }, []);

  const closeCancelModal = useCallback(() => setShowCancelModal(false), []);

  const confirmCancel = useCallback(() => {
    setShowCancelModal(false);
    // navigate home — keep same behavior as handleCancel
    setDestination(null);
    navigation.navigate('Tabs', { screen: 'Home' });
  }, [navigation]);

  // Android hardware back
  useEffect(() => {
    const onBackPress = () => {
      // if a modal is visible, close it instead of opening another
      if (showCancelModal || showNoDriverModal) {
        // prioritize closing the cancel modal first, else close nodriver
        if (showNoDriverModal) {
          setShowNoDriverModal(false);
          return true;
        }
        setShowCancelModal(false);
        return true; // handled
      }

      // show the cancel confirmation modal
      setShowCancelModal(true);
      return true; // prevent default
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [showCancelModal, showNoDriverModal]);

  // iOS / stack back gesture intercept
  useEffect(() => {
    const beforeRemove = (e: any) => {
      // If modal open, allow it (it will be closed by modal)
      if (showCancelModal || showNoDriverModal) {
        e.preventDefault();
        if (showNoDriverModal) setShowNoDriverModal(false);
        if (showCancelModal) setShowCancelModal(false);
        return;
      }

      // prevent default navigation and show cancel modal
      e.preventDefault();
      setShowCancelModal(true);
    };

    const sub = navigation.addListener('beforeRemove', beforeRemove);
    return () => navigation.removeListener('beforeRemove', beforeRemove);
  }, [navigation, showCancelModal, showNoDriverModal]);

  // === Fare handlers ===
  const handleFareChange = (delta: number) =>
    setCurrentFare(f => Math.max(0, Math.round((f + delta) * 1)));

  const handleRaiseFare = () => setCurrentFare(f => f + 20);

  // === No-driver modal actions ===
  const handleKeepSearching = () => {
    setShowNoDriverModal(false);
    setTimeLeft(TOTAL_TIME);
    // restart timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000) as unknown as number;
  };

  const handleNoDriverCancel = () => {
    setShowNoDriverModal(false);
    confirmCancel();
    navigation.navigate('Tabs', { screen: 'Home' });
  };

  // === Subcomponents (concise) ===
  const HeaderInfo = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Searching for drivers…</Text>
        <Text style={styles.headerSubtitle}>
          We’re scanning nearby drivers for the best match
        </Text>
      </View>

      <View style={styles.headerRight}>
        <Text style={styles.viewingText}>2 drivers</Text>
        <View style={styles.avatarStack}>
          <View
            style={[styles.avatar, { backgroundColor: COLORS.PRIMARY.DEFAULT }]}
          />
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: COLORS.BRAND_ACCENT.DEFAULT,
                marginLeft: -scale(10),
              },
            ]}
          />
        </View>
      </View>
    </View>
  );

  const FareCard = () => {
    const progress = useMemo(
      () => clamp(timeLeft / TOTAL_TIME, 0, 1),
      [timeLeft],
    );
    return (
      <View style={styles.card}>
        <View style={styles.fareTop}>
          <Text style={styles.fareLabel}>Fare</Text>
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            <Text style={styles.fareHint}>Searching…</Text>
          </View>
        </View>

        <View style={styles.progressWrap}>
          <View style={styles.progressBackground}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
        </View>

        <View style={styles.adjustRow}>
          <TouchableOpacity
            onPress={() => handleFareChange(-10)}
            style={styles.smallButton}
          >
            <Text style={styles.smallButtonText}>-10</Text>
          </TouchableOpacity>

          <View style={styles.currentFareWrap}>
            <Text style={styles.currentFareCurrency}>₹</Text>
            <Text style={styles.currentFareNumber}>{currentFare}</Text>
          </View>

          <TouchableOpacity
            onPress={() => handleFareChange(10)}
            style={styles.smallButton}
          >
            <Text style={styles.smallButtonText}>+10</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleRaiseFare}
          style={styles.primaryButton}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Raise fare</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const AutoAcceptCard = () => (
    <View style={[styles.card, styles.autoCard]}>
      <View style={styles.autoRow}>
        <View style={styles.autoLeft}>
          <Image
            source={icons.out}
            style={[styles.autoIcon, { tintColor: COLORS.PRIMARY.DEFAULT }]}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.autoTitle}>Auto-accept nearest driver</Text>
            <Text style={styles.autoSubtitle}>
              Automatically accept the nearest driver for ₹{currentFare}
            </Text>
          </View>
        </View>

        <Switch
          value={isAutoAcceptEnabled}
          onValueChange={() => setIsAutoAcceptEnabled(s => !s)}
          trackColor={{
            false: COLORS.GENERAL[300],
            true: COLORS.PRIMARY.DEFAULT,
          }}
          thumbColor={
            Platform.OS === 'android' ? COLORS.BRAND_WHITE : undefined
          }
        />
      </View>
    </View>
  );

  const LocationCard = () => (
    <View style={styles.card}>
      <View style={styles.locationRow}>
        <View style={styles.qrRow}>
          <Image
            source={icons.qrCode}
            style={[styles.qrIcon, { tintColor: COLORS.PRIMARY.DEFAULT }]}
          />
          <Text style={styles.qrText}>₹{currentFare} QR code</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.locationRow}>
        <View
          style={[styles.locationPin, { borderColor: COLORS.SUCCESS[500] }]}
        >
          <View
            style={[
              styles.locationInner,
              { backgroundColor: COLORS.SUCCESS[500] },
            ]}
          />
        </View>
        <View style={styles.locationInfo}>
          <Text style={styles.locationTitle}>Pickup</Text>
          <Text style={styles.locationText}>{location?.address ?? ''}</Text>
        </View>
      </View>

      <View style={styles.locationRow}>
        <View style={[styles.locationPin, { borderColor: COLORS.DANGER[500] }]}>
          <View
            style={[
              styles.locationInner,
              { backgroundColor: COLORS.DANGER[500] },
            ]}
          />
        </View>
        <View style={styles.locationInfo}>
          <Text style={styles.locationTitle}>Drop off</Text>
          <Text style={styles.locationText} numberOfLines={2}>
            {destination?.address ?? ''}
          </Text>
        </View>
      </View>
    </View>
  );

  // === Modal renderers (Option D: fullscreen dark overlay & centered minimal popup) ===
  const CancelModal = () =>
    showCancelModal ? (
      <Animated.View style={[styles.modalOverlay, modalOverlayStyle]}>
        <Animated.View style={[styles.modalBox, modalBoxStyle]}>
          <Text style={styles.modalTitle}>Cancel ride request?</Text>
          <Text style={styles.modalDesc}>
            Your search is in progress. Do you want to stop looking for a
            driver?
          </Text>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalBtn, styles.modalKeepBtn]}
              onPress={() => setShowCancelModal(false)}
            >
              <Text style={styles.modalKeepText}>No, keep searching</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalBtn, styles.modalCancelConfirmBtn]}
              onPress={confirmCancel}
            >
              <Text style={styles.modalCancelConfirmText}>Yes, cancel</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    ) : null;

  return (
    <RideLayout
      title="Finding Rider"
      snapPoints={['50%', '90%']}
      onBackPress={() => setShowCancelModal(true)}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <HeaderInfo />
          <FareCard />
          <AutoAcceptCard />
          <LocationCard />
        </View>

        {/* Modals */}
        <CancelModal />
        <NoDriverFoundModal
          isVisible={showNoDriverModal}
          onKeepSearching={handleKeepSearching}
          onCancel={handleNoDriverCancel}
        />
      </SafeAreaView>
    </RideLayout>
  );
};

// === Styles ===
const styles = StyleSheet.create({
  safe: { width: '100%' },
  container: {
    paddingHorizontal: scale(16),
    paddingTop: scale(12),
    paddingBottom: scale(20),
    backgroundColor: COLORS.BG.DEFAULT,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  headerTitle: {
    fontSize: scale(16),
    fontWeight: '700',
    color: COLORS.TEXT.DEFAULT,
  },
  headerSubtitle: {
    fontSize: scale(12),
    color: COLORS.TEXT.MUTED,
    marginTop: scale(2),
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  viewingText: {
    fontSize: scale(12),
    color: COLORS.TEXT.MUTED,
  },
  avatarStack: {
    flexDirection: 'row',
    marginTop: scale(6),
  },
  avatar: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    borderWidth: 2,
    borderColor: COLORS.BG.DEFAULT,
    elevation: 2,
  },

  // Card
  card: {
    backgroundColor: COLORS.BG.MUTED,
    borderRadius: scale(14),
    padding: scale(14),
    marginBottom: scale(12),
    ...Platform.select({
      ios: {
        shadowColor: COLORS.BRAND_BLACK,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  fareTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fareLabel: {
    color: COLORS.TEXT.MUTED,
    fontSize: scale(12),
    marginBottom: scale(6),
  },
  timerContainer: {
    alignItems: 'flex-end',
  },
  timerText: {
    fontSize: scale(14),
    fontWeight: '700',
    color: COLORS.PRIMARY.DEFAULT,
  },
  fareHint: {
    fontSize: scale(11),
    color: COLORS.TEXT.MUTED,
    marginTop: scale(4),
  },

  progressWrap: {
    marginTop: scale(12),
    marginBottom: scale(12),
  },
  progressBackground: {
    height: scale(8),
    backgroundColor: COLORS.GENERAL[300],
    borderRadius: scale(8),
    overflow: 'hidden',
  },
  progressFill: {
    height: scale(8),
    backgroundColor: COLORS.PRIMARY.DEFAULT,
  },

  adjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: scale(12),
  },
  smallButton: {
    width: scale(64),
    height: scale(40),
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: COLORS.PRIMARY.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallButtonText: {
    color: COLORS.PRIMARY.DEFAULT,
    fontWeight: '700',
    fontSize: scale(16),
  },

  currentFareWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    flex: 1,
  },
  currentFareCurrency: {
    fontSize: scale(40),
    fontWeight: '700',
    color: COLORS.TEXT.DEFAULT,
    marginRight: scale(6),
  },
  currentFareNumber: {
    fontSize: scale(40),
    fontWeight: '900',
    color: COLORS.TEXT.DEFAULT,
  },

  primaryButton: {
    marginTop: scale(4),
    backgroundColor: COLORS.PRIMARY.DEFAULT,
    paddingVertical: scale(12),
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.BRAND_WHITE,
    fontSize: scale(16),
    fontWeight: '700',
  },

  // Auto accept
  autoCard: {
    paddingVertical: scale(10),
    paddingHorizontal: scale(12),
  },
  autoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  autoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: scale(8),
  },
  autoIcon: {
    width: scale(28),
    height: scale(28),
    marginRight: scale(10),
  },
  autoTitle: {
    fontSize: scale(14),
    fontWeight: '700',
    color: COLORS.TEXT.DEFAULT,
  },
  autoSubtitle: {
    fontSize: scale(12),
    color: COLORS.TEXT.MUTED,
    marginTop: scale(2),
  },

  // Location
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(8),
  },
  qrRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrIcon: {
    width: scale(22),
    height: scale(22),
    marginRight: scale(10),
  },
  qrText: {
    color: COLORS.PRIMARY.DEFAULT,
    fontWeight: '700',
    fontSize: scale(14),
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.GENERAL[300],
    marginVertical: scale(8),
    borderRadius: 1,
  },
  locationPin: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  locationInner: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontSize: scale(12),
    color: COLORS.TEXT.MUTED,
    marginBottom: scale(2),
  },
  locationText: {
    fontSize: scale(14),
    color: COLORS.TEXT.DEFAULT,
    fontWeight: '600',
  },
});

export default FindRiderScreen;
