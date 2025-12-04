import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { useRiderStore } from "@/store";
import { MarkerData } from "@/types/declare";

interface Props {
  mapRef: React.RefObject<any>;
}

const useRiderMarkerLogic = ({ mapRef }: Props) => {
  const { location } = useRiderStore();

  const [marker, setMarker] = useState<MarkerData | null>(null);
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

  // Generate marker when location changes
  useEffect(() => {
    if (location) {
      const riderMarker: MarkerData = {
        id: 'rider',
        latitude: location.latitude,
        longitude: location.longitude,
        name: 'You are here',
      };
      setMarker(riderMarker);
    }
  }, [location]);

  // Recenter map helper
  const recenterMap = () => {
    if (mapRef.current && location) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }
  };

  return { marker, pulseAnim, recenterMap };
};

export default useRiderMarkerLogic;
