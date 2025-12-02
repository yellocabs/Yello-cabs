import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { Region } from 'react-native-maps';

const useMapAnimation = (
  mapRef: React.RefObject<any>,
  mapReady: boolean,
  userLatitude: number | null,
  userLongitude: number | null,
  destinationLatitude: number | null,
  destinationLongitude: number | null,
  bottomOffset: number,
) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [hasAnimated, setHasAnimated] = useState(false);

  // --- User location animation ---
  useEffect(() => {
    if (mapReady && userLatitude && userLongitude && !hasAnimated) {
      const userLoc = { latitude: userLatitude, longitude: userLongitude };
      const zoomInUserRegion: Region = {
        ...userLoc,
        latitudeDelta: 0.0015,
        longitudeDelta: 0.0015,
      };
      mapRef.current.animateToRegion(zoomInUserRegion, 1500);
      setHasAnimated(true);
    }
  }, [mapReady, userLatitude, userLongitude, hasAnimated, mapRef]);

  // --- Fit to coordinates animation ---
  useEffect(() => {
    if (
      mapReady &&
      userLatitude &&
      userLongitude &&
      destinationLatitude &&
      destinationLongitude
    ) {
      const userLoc = { latitude: userLatitude, longitude: userLongitude };
      const destLoc = {
        latitude: destinationLatitude,
        longitude: destinationLongitude,
      };
      mapRef.current?.fitToCoordinates([userLoc, destLoc], {
        edgePadding: {
          top: 100,
          right: 100,
          bottom: bottomOffset,
          left: 100,
        },
        animated: true,
      });
    }
  }, [
    mapReady,
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
    bottomOffset,
    mapRef,
  ]);

  return { pulseAnim };
};

export default useMapAnimation;
