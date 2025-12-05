// --- IMPORTS ---
import { createRide } from '@/services/rideService';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLocationStore } from '@/store';
import { calculateFare, fetchDistance } from '@/utils/mapUtils';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import CustomButton from '@/components/shared/custom-button';
import RideLayout from '@/components/customer/ride-layout';

// -------------------------------------------------------------------

export default function FindOffers() {
  const navigation = useNavigation();
  const route: any = useRoute();

  const { pickup, destination } = useLocationStore();
  const { rideType } = route.params || {};

  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Ride Options
  const RIDE_OPTIONS = useMemo(() => {
    if (!distance) return [];

    return [
      {
        id: 'moto',
        name: 'Moto',
        time: '3 min away',
        price: calculateFare('moto', distance),
      },
      {
        id: 'car',
        name: 'Car',
        time: '5 min away',
        price: calculateFare('car', distance),
      },
      {
        id: 'auto',
        name: 'Auto',
        time: '4 min away',
        price: calculateFare('auto', distance),
      },
    ];
  }, [distance]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCreateRide = async (option: any) => {
    const ridePayload = {
      rideType: option.name,
      pickup,
      destination,
      distance,
      fare: option.price,
    };

    await createRide(ridePayload);
    navigation.navigate('FindingDriver', { ridePayload });
  };

  // -------------------------------------------------------------------

  if (loading) {
    return (
      <RideLayout
        title="Finding rides..."
        icon={<Ionicons name="car-outline" size={32} color="white" />}
      >
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </RideLayout>
    );
  }

  return (
    <RideLayout
      title="Choose your ride"
      subtitle={`${distance?.toFixed(2)} km distance`}
      icon={<Ionicons name="location" size={32} color="white" />}
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons name="chevron-back" size={28} color="#fff" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {RIDE_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.id}
            style={styles.offerCard}
            onPress={() => handleCreateRide(option)}
          >
            {/* Icon */}
            <View style={styles.offerIconContainer}>
              <Ionicons
                name={
                  option.id === 'car'
                    ? 'car-sport'
                    : option.id === 'auto'
                      ? 'car-outline'
                      : 'bicycle'
                }
                size={28}
                color="white"
              />
            </View>

            {/* Text */}
            <View style={{ flex: 1 }}>
              <Text style={styles.offerName}>
                {option.name}{' '}
                <Ionicons
                  name="information-circle-outline"
                  size={14}
                  color="#ccc"
                />
              </Text>
              <Text style={styles.offerTime}>{option.time}</Text>
            </View>

            {/* Price */}
            <Text style={styles.offerPrice}>₹{option.price}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom Button */}
      <CustomButton
        title="Confirm Ride"
        onPress={() => handleCreateRide(RIDE_OPTIONS[0])}
        style={{ marginTop: 20 }}
      />
    </RideLayout>
  );
}

// -------------------------------------------------------------------

const styles = StyleSheet.create({
  centered: {
    paddingTop: 40,
    alignItems: 'center',
  },
  backButton: {
    padding: 5,
    alignSelf: 'flex-start',
  },
  offerCard: {
    backgroundColor: '#1b1b1b',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  offerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  offerName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  offerTime: {
    color: '#bbb',
    fontSize: 13,
    marginTop: 3,
  },
  offerPrice: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});
