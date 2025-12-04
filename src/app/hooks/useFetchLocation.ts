import { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoding';
import { useRiderStore } from '@/store';
import { useLocationStore } from '@/store/location-store';

export const useFetchLocation = () => {
  const { setUserLocation } = useLocationStore();
  const { setLocation: setRiderLocation } = useRiderStore();

  const [address, setAddress] = useState('Fetching location...');
  // State to control the visibility of your custom pre-permission modal (Image 2)
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);

  // --- Core Geolocation Logic ---
  const getLocation = async () => {
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (!hasPermission) {
      console.log('Location Permission Denied');
      setAddress('Permission denied');
      return;
    }

    Geolocation.getCurrentPosition(
      async position => {
        console.log('Success => hello', position);

        const { latitude, longitude, heading } = position.coords;

        Geocoder.init('AIzaSyAC8JJ79eaC8PjAdFpNImUTjpRuJXUcWMM');

        try {
          const geoResponse = await Geocoder.from(latitude, longitude);
          const formatted = geoResponse.results[0].formatted_address;

          console.log('Formatted Address: ', formatted);

          setAddress(formatted);
          setUserLocation({ latitude, longitude, address: formatted });
          setRiderLocation({
            latitude,
            longitude,
            address: formatted,
            heading,
          });
        } catch (e) {
          console.log('Geocoder Error:', e);
          setAddress('Unable to fetch address');
          setUserLocation({ latitude, longitude, address: 'Unknown location' });
          setRiderLocation({
            latitude,
            longitude,
            address: 'Unknown location',
            heading,
          });
        }
      },
      error => {
        console.log('Geolocation Error:', error);
        setAddress('Error getting location');
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  // --- Permission Request Logic ---
  // This function is now exposed and will be called by the custom modal
  const requestLocationPermission = async () => {
    // Hide the custom modal before triggering the OS prompt (Image 1)
    setShowPermissionModal(false);

    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'YelloCabs Location Permission',
            message: 'Yello Cabs needs access to your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setHasPermission(true);
          getLocation();
        } else {
          setHasPermission(false);
          setAddress('Permission denied');
        }
      } else {
        // For iOS, the permission request is handled implicitly by Geolocation.getCurrentPosition
        // or you would use 'react-native-permissions' library here for better control.
        // For simplicity, we assume iOS will prompt or has already been handled.
        getLocation();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // --- Initial Check and Flow Control ---
  const initialCheck = async () => {
    if (Platform.OS === 'android') {
      const isGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      if (isGranted) {
        setHasPermission(true);
        getLocation();
      } else {
        setHasPermission(false);
        // Permission not granted, show the custom modal (Image 2)
        setShowPermissionModal(true);
      }
    } else {
      // For iOS, just attempt to get location, which will prompt if needed
      getLocation();
    }
  };

  useEffect(() => {
    initialCheck();
  }, []);

  // Return the new state and trigger function
  return {
    address,
    hasPermission,
    showPermissionModal,
    requestLocationPermission,
    dismissPermissionModal: () => setShowPermissionModal(false), // To handle 'Not Now'
  };
};
