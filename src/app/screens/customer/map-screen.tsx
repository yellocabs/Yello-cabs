import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { useUserStore } from '@/store';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomButton from '@/components/shared/custom-button';

import { COLORS } from '@/assets/colors';

// ...

const MapScreen: React.FC = () => {
  // ...

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
      />
      <View style={styles.markerFixed}>
        <Ionicons name="location-pin" size={40} color={COLORS.DANGER[600]} />
      </View>
      <View style={styles.buttonContainer}>
        <CustomButton title="Confirm Location" onPress={handleConfirm} />
      </View>
      <View style={styles.closeButton}>
        <CustomButton title="Close" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerFixed: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -20,
    marginTop: -40,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
});

export default MapScreen;
