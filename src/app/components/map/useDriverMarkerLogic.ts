import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { useDriverStore, useLocationStore } from "@/store";
import { generateMarkersFromData, calculateDriverTimes } from "@/libs/map";
import { MarkerData, Driver } from "@/types/declare";

interface Props {
  mapRef: React.RefObject<any>;
}

const useDriverMarkerLogic = ({ mapRef }: Props) => {
  const { userLatitude, userLongitude, destinationLatitude, destinationLongitude } = useLocationStore();
  const { drivers, setDrivers } = useDriverStore(); // assuming you store driver array here

  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation loop
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  // Generate markers when location or drivers change
  useEffect(() => {
    if (userLatitude && userLongitude && drivers?.length) {
      const generated = generateMarkersFromData({
        data: drivers as Driver[], 
        userLatitude,
        userLongitude,
      });
      setMarkers(generated);
    }
  }, [userLatitude, userLongitude, drivers]);

  // Calculate driver times
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (
        markers.length > 0 &&
        userLatitude &&
        userLongitude &&
        destinationLatitude &&
        destinationLongitude
      ) {
        try {
          const updatedTimes = await calculateDriverTimes(
            markers,
            { latitude: destinationLatitude, longitude: destinationLongitude }
          );

          if (!cancelled && updatedTimes?.length) {
            // Merge ETA/distance into markers
            const updatedMarkers = markers.map((marker) => {
              const driverTime = updatedTimes.find((d) => d.driverId === marker.id);
              return {
                ...marker,
                eta: driverTime?.eta || null,
                distance: driverTime?.distance || null,
              };
            });
            setDrivers(updatedMarkers);
          }
        } catch (e) {
          console.warn("calculateDriverTimes err:", e);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [markers, userLatitude, userLongitude, destinationLatitude, destinationLongitude, setDrivers]);

  // Recenter map helper
  const recenterMap = () => {
    if (mapRef.current && userLatitude && userLongitude) {
      mapRef.current.animateToRegion(
        {
          latitude: userLatitude,
          longitude: userLongitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }
  };

  return { markers, pulseAnim, recenterMap };
};

export default useDriverMarkerLogic;
