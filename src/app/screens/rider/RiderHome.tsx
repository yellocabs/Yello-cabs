import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Map from '@/components/map'; // Assuming a reusable Map component exists
import CustomButton from '@/components/shared/custom-button';
import { useUserStore } from '@/store';
import { COLORS } from '@/assets/colors';
import { useWS } from '@/services/WSProvider';

const RiderHomeScreen = () => {
  const [isOnline, setIsOnline] = useState(false);
  const { location } = useUserStore();
  const { emit, disconnect } = useWS();

  const handleToggleOnline = () => {
    console.log('handleToggleOnline');
    if (isOnline) {
      // Go Offline
      emit('goOffDuty');
      disconnect(); // As requested by user, though goOffDuty is often enough
      setIsOnline(false);
    } else {
      // Go Online
      if (location) {
        emit('goOnDuty', {
          coords: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          vehicleId: 'your-vehicle-id', // TODO: Replace with actual vehicle ID
        });
        setIsOnline(true);
      } else {
        // TODO: Handle case where location is not available
        console.warn('Cannot go online without location.');
      }
    }
  };

  useEffect(() => {
    let locationUpdateInterval: NodeJS.Timeout;
    if (isOnline && location) {
      // Send location updates every 10 seconds
      locationUpdateInterval = setInterval(() => {
        emit('updateLocation', {
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }, 10000);
    }

    return () => {
      if (locationUpdateInterval) {
        clearInterval(locationUpdateInterval);
      }
    };
  }, [isOnline, location, emit]);

  return (
    <View style={styles.container}>
      <Map
        latitude={location?.latitude}
        longitude={location?.longitude}
        // Markers for nearby ride requests could be passed here
      />
      <View style={styles.bottomContainer}>
        <Text style={styles.statusText}>
          You are currently {isOnline ? 'Online' : 'Offline'}
        </Text>
        <CustomButton
          title={isOnline ? 'Go Offline' : 'Go Online'}
          onPress={handleToggleOnline}
          className={isOnline ? 'bg-danger-500' : 'bg-success-500'}
        />
        {isOnline && (
          <View style={styles.requestsContainer}>
            <Text style={styles.requestsTitle}>Incoming Requests</Text>
            {/* This is where you would list incoming ride requests */}
            <Text style={styles.noRequestsText}>No new requests yet.</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG.DEFAULT,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.BRAND_WHITE,
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: COLORS.TEXT.DEFAULT,
  },
  requestsContainer: {
    marginTop: 16,
  },
  requestsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.TEXT.DEFAULT,
  },
  noRequestsText: {
    textAlign: 'center',
    color: COLORS.TEXT.MUTED,
  },
});

export default RiderHomeScreen;
