// src/app/screens/customer/find-rider.tsx
import React, { useMemo, useState } from 'react';
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
} from 'react-native';
import { icons } from '@/constants';
import { COLORS } from '@/assets/colors';
import RideLayout from '@/components/customer/ride-layout';

// --- Responsive Utilities ---
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

// --- Component ---
const RideFareComponent: React.FC = ({ route, navigation }) => {
  const { price } = route.params || {};
  const [currentFare, setCurrentFare] = useState<number>(price);
  const [isAutoAcceptEnabled, setIsAutoAcceptEnabled] =
    useState<boolean>(false);

  // Example average fare to compute "below average" progress (you can replace with real value)
  const AVERAGE_FARE = 180;
  const progress = useMemo(
    () => clamp(currentFare / Math.max(AVERAGE_FARE, 1), 0, 1),
    [currentFare],
  );

  const handleFareChange = (change: number) => {
    setCurrentFare(prev => Math.max(0, prev + change));
  };

  const handleRaiseFare = () => {
    // Default raise amount — you can modify or expose via props
    setCurrentFare(prev => prev + 20);
  };

  const handleToggleAutoAccept = () => {
    setIsAutoAcceptEnabled(s => !s);
  };

  const handleCancel = () => {
    // Hook your cancel logic here (navigation, API call etc.)
    console.log('Cancel request');
  };

  // --- Subcomponents ---
  const HeaderInfo = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>Finding Driver</Text>
        <Text style={styles.headerSubtitle}>
          We’re searching nearby drivers for you
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

  const FareCard = () => (
    <View style={styles.card}>
      <View style={styles.fareTop}>
        <View>
          <Text style={styles.fareLabel}>Fare</Text>
          <Text style={styles.fareBig}>
            <Text style={styles.currency}>₹</Text>
            {currentFare}
          </Text>
        </View>

        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>1:55</Text>
          <Text style={styles.fareHint}>Below avg</Text>
        </View>
      </View>

      {/* progress bar showing how far from average fare */}
      <View style={styles.progressWrap}>
        <View style={styles.progressBackground}>
          <View
            style={[styles.progressFill, { width: `${progress * 100}%` }]}
          />
        </View>
        <View style={styles.progressMeta}>
          <Text style={styles.progressText}>
            {Math.round(progress * 100)}% of avg
          </Text>
          <Text style={styles.avgText}>Avg ₹{AVERAGE_FARE}</Text>
        </View>
      </View>

      {/* fare adjuster */}
      <View style={styles.adjustRow}>
        <TouchableOpacity
          onPress={() => handleFareChange(-10)}
          style={styles.smallButton}
          accessibilityLabel="Decrease fare by ten rupees"
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
          accessibilityLabel="Increase fare by ten rupees"
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

  const AutoAcceptCard = () => (
    <View style={styles.cardRow}>
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
            onValueChange={handleToggleAutoAccept}
            trackColor={{
              false: COLORS.GENERAL[300],
              true: COLORS.PRIMARY.DEFAULT,
            }}
            thumbColor={
              Platform.OS === 'android' ? COLORS.BRAND_WHITE : undefined
            }
            ios_backgroundColor={COLORS.GENERAL[300]}
          />
        </View>
      </View>
    </View>
  );

  const LocationCard = () => (
    <View style={styles.card}>
      <View style={styles.locationRow}>
        <View style={styles.qrRow}>
          <Image source={icons.qrCode} style={styles.qrIcon} />
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
          <Text style={styles.locationText}>TDI City Road No. 1</Text>
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
            Railway Station Road (Sector 18, Panchkula, Haryana)
          </Text>
        </View>
      </View>
    </View>
  );

  const FooterActions = () => (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.ghostButton} onPress={handleCancel}>
        <Text style={styles.ghostButtonText}>Cancel request</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.ctaButton}>
        <Text style={styles.ctaText}>Contact support</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <RideLayout title="Finding Rider" snapPoints={['60%', '80%', '90%']}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <HeaderInfo />
          <FareCard />
          <AutoAcceptCard />
          <LocationCard />
          <FooterActions />
        </View>
      </SafeAreaView>
    </RideLayout>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safe: {
    width: '100%',
  },
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
  fareBig: {
    fontSize: scale(34),
    fontWeight: '800',
    color: COLORS.TEXT.DEFAULT,
    lineHeight: scale(38),
  },
  currency: {
    fontSize: scale(20),
    fontWeight: '700',
    marginRight: scale(6),
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
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: scale(8),
  },
  progressText: {
    fontSize: scale(12),
    color: COLORS.TEXT.MUTED,
  },
  avgText: {
    fontSize: scale(12),
    color: COLORS.TEXT.MUTED,
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
    backgroundColor: 'transparent',
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
    fontSize: scale(18),
    fontWeight: '700',
    color: COLORS.TEXT.DEFAULT,
    marginRight: scale(6),
  },
  currentFareNumber: {
    fontSize: scale(36),
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
  cardRow: {
    marginBottom: scale(8),
  },
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
    tintColor: COLORS.PRIMARY.DEFAULT,
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

  // Footer actions
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: scale(6),
  },
  ghostButton: {
    flex: 1,
    marginRight: scale(8),
    backgroundColor: COLORS.BG.MUTED,
    borderRadius: scale(12),
    paddingVertical: scale(12),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.GENERAL[300],
  },
  ghostButtonText: {
    color: COLORS.TEXT.MUTED,
    fontWeight: '700',
  },
  ctaButton: {
    paddingVertical: scale(12),
    paddingHorizontal: scale(14),
    borderRadius: scale(12),
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY.DEFAULT,
  },
  ctaText: {
    color: COLORS.PRIMARY.DEFAULT,
    fontWeight: '700',
  },
});

export default RideFareComponent;
