import React, { useState } from 'react';
import { View, Modal, StyleSheet } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { useLocationStore } from '@/store';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomButton from './custom-button';

interface MapPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  title: string;
}

const MapPickerModal: React.FC<MapPickerModalProps> = ({
  visible,
  onClose,
  onSelectLocation,
  title,
}) => {
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
        onSelectLocation({
          latitude: region.latitude,
          longitude: region.longitude,
          address: data.results[0].formatted_address,
        });
      } else {
        // Fallback if geocoding fails
        onSelectLocation({
          latitude: region.latitude,
          longitude: region.longitude,
          address: `${region.latitude.toFixed(4)}, ${region.longitude.toFixed(4)}`,
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
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
          <CustomButton title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
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

export default MapPickerModal;
