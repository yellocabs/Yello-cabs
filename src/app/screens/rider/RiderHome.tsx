import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Map from '@/components/map'; // Assuming a reusable Map component exists
import CustomButton from '@/components/shared/custom-button';
import { useUserStore } from '@/store';
import { COLORS } from '@/assets/colors';

const RiderHomeScreen = () => {
  const [isOnline, setIsOnline] = useState(false);
  const { location } = useUserStore();

  const handleToggleOnline = () => {
    setIsOnline(!isOnline);
    // Here you would also make an API call to update the driver's status
  };

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
