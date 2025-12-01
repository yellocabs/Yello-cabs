import { useEffect, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import Geolocation from "@react-native-community/geolocation";
import Geocoder from "react-native-geocoding";
import { useLocationStore } from "@/store/location-store";

export const useFetchLocation = () => {
  const { setUserLocation } = useLocationStore();

  const [address, setAddress] = useState("Fetching location...");
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "YelloCabs Location Permission",
            message: "Yello Cabs needs access to your location.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getLocation();
        } else {
          setHasPermission(false);
          setAddress("Permission denied");
        }
      } else {
        getLocation();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getLocation = async () => {
    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        Geocoder.init("YOUR_GOOGLE_KEY");

        try {
          const geoResponse = await Geocoder.from(latitude, longitude);
          const formatted = geoResponse.results[0].formatted_address;

          setAddress(formatted);

          setUserLocation({
            latitude,
            longitude,
            address: formatted,
          });
        } catch {
          setAddress("Unable to fetch address");

          setUserLocation({
            latitude,
            longitude,
            address: "Unknown location",
          });
        }
      },
      () => setAddress("Error getting location"),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  return { address, hasPermission };
};
