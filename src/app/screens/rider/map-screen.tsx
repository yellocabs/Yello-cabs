import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { useLocationStore } from '@/store';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomButton from '@/components/custom-button';
import { useNavigation, useRoute } from '@react-navigation/native';

const MapScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userLatitude, userLongitude } = useLocationStore();
  const [region, setRegion] = useState<Region>({
    latitude: userLatitude || 37.78825,
    longitude: userLongitude || -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const handleRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);
  };

  const handleConfirm = async () => {
    // Reverse geocode to get address
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${region.latitude},${region.longitude}&key=AIzaSyAC8JJ79eaC8PjAdFpNImUTjpRuJXUcWMM`,
      );
      const data = await response.json();
      if (data.status === 'OK' && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        // @ts-ignore
        navigation.navigate('Tabs', {
          screen: 'Home',
          params: {
            location: {
              latitude: region.latitude,
              longitude: region.longitude,
              address: address,
            },
            type: route.params?.type,
          },
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
      />
      <View style={styles.markerFixed}>
        <Ionicons name="location-pin" size={40} color="red" />
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
