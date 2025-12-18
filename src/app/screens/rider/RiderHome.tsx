import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Map from '@/components/map';
import { useRiderStore, useUserStore } from '@/store';
import { useWS } from '@/services/WSProvider';
import { COLORS } from '@/assets/colors';
import LocationPermissionModal from '@/components/shared/location-permission-modal';
import { useFetchLocation } from '@/hooks/useFetchLocation';
import CustomButton from '@/components/shared/custom-button';
import { useDriverStore } from '@/store/driver-store';

const OFFER_TIMEOUT = 10; // seconds

type RideOffer = {
  rideId: string;
  customerId: string;
  customerName: string;
  startPosition: { lat: number; long: number; adrs: string };
  destinationPosition: { lat: number; long: number; adrs: string };
  fair: number;
  distance: string;
  vehicleType: string;
  receivedAt: number; // timestamp
};

const RiderHomeScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { driverProfile } = useDriverStore();
  const vehicleType = driverProfile?.data.vehicles[0].id;
  const { location } = useRiderStore();
  const { emit, on, off, isConnected } = useWS();
  const {
    showPermissionModal,
    requestLocationPermission,
    dismissPermissionModal,
  } = useFetchLocation();

  const [isOnline, setIsOnline] = useState(false);
  const [offers, setOffers] = useState<RideOffer[]>([]);
  const [timers, setTimers] = useState<{ [rideId: string]: number }>({});

  const [suggestFareModal, setSuggestFareModal] = useState<{
    visible: boolean;
    rideId: string | null;
    currentFare: number;
  }>({ visible: false, rideId: null, currentFare: 0 });
  const [newFare, setNewFare] = useState('');

  // Main timer loop
  useEffect(() => {
    const interval = setInterval(() => {
      setOffers(
        prevOffers =>
          prevOffers
            .map(offer => {
              const elapsed = (Date.now() - offer.receivedAt) / 1000;
              const remaining = OFFER_TIMEOUT - elapsed;
              if (remaining <= 0) {
                return { ...offer, expired: true };
              }
              return offer;
            })
            .filter(
              offer =>
                !offer.expired ||
                (Date.now() - offer.receivedAt) / 1000 < OFFER_TIMEOUT + 5,
            ), // Keep expired for 5 more seconds
      );
      setTimers(prevTimers => {
        const newTimers = { ...prevTimers };
        let needsUpdate = false;
        offers.forEach(offer => {
          const elapsed = (Date.now() - offer.receivedAt) / 1000;
          const newRemaining = Math.max(0, Math.ceil(OFFER_TIMEOUT - elapsed));
          if (newTimers[offer.rideId] !== newRemaining) {
            newTimers[offer.rideId] = newRemaining;
            needsUpdate = true;
          }
        });
        return needsUpdate ? newTimers : prevTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [offers]);

  // Socket listener for new ride offers
  useEffect(() => {
    const handleRideOffer = (newOffer: Omit<RideOffer, 'receivedAt'>) => {
      setOffers(prev => [...prev, { ...newOffer, receivedAt: Date.now() }]);
      setTimers(prev => ({ ...prev, [newOffer.rideId]: OFFER_TIMEOUT }));
    };

    on('rideOffer', handleRideOffer);

    return () => {
      off('rideOffer', handleRideOffer);
    };
  }, [on, off]);

  const handleToggleOnline = () => {
    console.log('handleToggleOnline called. Current isOnline state:', isOnline);
    if (isOnline) {
      console.log('Going off duty...');
      emit('goOffDuty');
      setIsOnline(false);
      console.log('Set isOnline to false.');
    } else {
      if (!location || !vehicleType) {
        console.warn('Cannot go online: Location or vehicleType missing.', {
          location,
          vehicleType,
        });
        return;
      }

      const goOnDuty = () => {
        console.log('Emitting goOnDuty with vehicleType:', vehicleType);
        emit('goOnDuty', {
          coords: {
            lat: location.latitude,
            long: location.longitude,
            adrs: 'Mohali, Punjab',
          },
          vehicleId: vehicleType,
        });
        setIsOnline(true);
        console.log('Set isOnline to true.');
      };

      if (isConnected()) {
        goOnDuty();
      } else {
        const onConnect = () => {
          goOnDuty();
          off('connect', onConnect);
        };
        on('connect', onConnect);
      }
    }
  };

  const handleAccept = (rideId: string) => {
    emit('acceptRide', { rideId });
    // Assume ride acceptance is successful
    setIsOnline(false); // No longer just "online", but "in-ride"
    setOffers([]); // Clear all offers
    // Navigate to the active ride screen
    navigation.navigate('ActiveRide', { rideId }); // Assuming ActiveRide screen exists
  };

  const handleSuggestFare = () => {
    if (suggestFareModal.rideId && newFare) {
      emit('suggestFare', {
        rideId: suggestFareModal.rideId,
        suggestedFare: parseFloat(newFare),
      });
      setSuggestFareModal({ visible: false, rideId: null, currentFare: 0 });
      setNewFare('');
      // Remove the offer card after suggesting a new fare
      setOffers(prev => prev.filter(o => o.rideId !== suggestFareModal.rideId));
    }
  };

  const renderOfferCard = ({ item }: { item: RideOffer }) => {
    const remainingTime = timers[item.rideId] ?? OFFER_TIMEOUT;
    const isExpired = remainingTime <= 0;

    return (
      <View style={styles.requestCard}>
        <Text style={styles.requestTitle}>New Ride Offer</Text>
        <View style={styles.requestRow}>
          <Text style={styles.label}>From</Text>
          <Text style={styles.value}>{item.startPosition.adrs}</Text>
        </View>
        <View style={styles.requestRow}>
          <Text style={styles.label}>To</Text>
          <Text style={styles.value}>{item.destinationPosition.adrs}</Text>
        </View>
        <View style={styles.requestFooter}>
          <Text style={styles.price}>₹{item.fair}</Text>
          <Text style={styles.distance}>{item.distance}</Text>
        </View>

        <View style={styles.cardActions}>
          <CustomButton
            title="Suggest Fare"
            onPress={() =>
              setSuggestFareModal({
                visible: true,
                rideId: item.rideId,
                currentFare: item.fair,
              })
            }
            className="flex-1 bg-gray-200"
            textClassName="text-black"
            disabled={isExpired}
          />
          <CustomButton
            title={
              isExpired
                ? 'Expired'
                : `Accept (${remainingTime.toString().padStart(2, '0')}s)`
            }
            onPress={() => handleAccept(item.rideId)}
            className={`flex-1 ${isExpired ? 'bg-gray-400' : 'bg-success-500'}`}
            disabled={isExpired}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LocationPermissionModal
        isVisible={showPermissionModal}
        onEnable={requestLocationPermission}
        onNotNow={dismissPermissionModal}
      />
      <Map latitude={location?.latitude} longitude={location?.longitude} />

      <SafeAreaView style={styles.statusWrapper}>
        <TouchableOpacity
          onPress={handleToggleOnline}
          style={[styles.statusPill, isOnline ? styles.online : styles.offline]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isOnline ? '#22c55e' : '#f97316' },
            ]}
          />
          <Text style={styles.statusText}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>

      {isOnline && offers.length > 0 ? (
        <FlatList
          data={offers}
          renderItem={renderOfferCard}
          keyExtractor={item => item.rideId}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.offerList}
        />
      ) : isOnline ? (
        <View style={styles.noOffersContainer}>
          <Text style={styles.noOffersText}>Waiting for ride offers...</Text>
        </View>
      ) : (
        <View style={styles.bottomAction}>
          <CustomButton
            title="Go Online"
            onPress={handleToggleOnline}
            className="bg-success-500"
          />
        </View>
      )}

      <Modal
        transparent
        visible={suggestFareModal.visible}
        onRequestClose={() =>
          setSuggestFareModal({ visible: false, rideId: null, currentFare: 0 })
        }
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Suggest a New Fare</Text>
            <Text style={styles.modalSubtitle}>
              Current Fare: ₹{suggestFareModal.currentFare}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter new fare"
              keyboardType="numeric"
              value={newFare}
              onChangeText={setNewFare}
            />
            <CustomButton
              title="Submit Suggestion"
              onPress={handleSuggestFare}
            />
            <TouchableOpacity
              style={{ marginTop: 10 }}
              onPress={() =>
                setSuggestFareModal({
                  visible: false,
                  rideId: null,
                  currentFare: 0,
                })
              }
            >
              <Text style={{ textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG.DEFAULT },
  statusWrapper: { position: 'absolute', top: 10, left: 16 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  online: { backgroundColor: '#ecfdf5' },
  offline: { backgroundColor: '#fff7ed' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontWeight: '600', color: COLORS.TEXT.DEFAULT },
  offerList: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    paddingRight: 50,
  },
  requestCard: {
    width: 320,
    backgroundColor: COLORS.BRAND_WHITE,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    marginRight: 16,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: COLORS.TEXT.DEFAULT,
  },
  requestRow: { marginBottom: 6 },
  label: { fontSize: 12, color: COLORS.TEXT.MUTED },
  value: { fontSize: 14, fontWeight: '600', color: COLORS.TEXT.DEFAULT },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  price: { fontSize: 18, fontWeight: '700', color: COLORS.PRIMARY.DEFAULT },
  distance: { fontSize: 14, color: COLORS.TEXT.MUTED },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  noOffersContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  noOffersText: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalSubtitle: { fontSize: 14, color: 'gray', marginBottom: 20 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.GENERAL[100],
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  bottomAction: { position: 'absolute', bottom: 24, left: 16, right: 16 },
});

export default RiderHomeScreen;
