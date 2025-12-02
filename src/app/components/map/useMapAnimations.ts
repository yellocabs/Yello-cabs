import { useEffect } from 'react';
import { Region } from 'react-native-maps';
import { bottomOffset } from './constants';

interface Props {
  mapRef: React.RefObject<any>;
  mapReady: boolean;
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
}

const wait = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

const useMapAnimations = ({
  mapRef,
  mapReady,
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: Props) => {
  useEffect(() => {
    if (!mapReady || !userLatitude || !userLongitude) return;

    let cancelled = false;

    const animateSequence = async () => {
      const duration = 1500;
      const delay = 700;
      const zoomInDelta = 0.0015;
      const zoomOutDelta = 0.009;

      const userLoc: Region = {
        latitude: userLatitude,
        longitude: userLongitude,
        latitudeDelta: 0,
        longitudeDelta: 0,
      };
      const zoomInUserRegion = {
        ...userLoc,
        latitudeDelta: zoomInDelta,
        longitudeDelta: zoomInDelta,
      };
      const zoomOutUserRegion = {
        ...userLoc,
        latitudeDelta: zoomOutDelta,
        longitudeDelta: zoomOutDelta,
      };

      mapRef.current?.animateToRegion(zoomInUserRegion, duration);
      await wait(duration + delay);
      if (cancelled) return;

      mapRef.current?.animateToRegion(zoomOutUserRegion, duration);
      await wait(duration + delay);
      if (cancelled) return;

      if (!destinationLatitude || !destinationLongitude) return;

      const destLoc: Region = {
        latitude: destinationLatitude,
        longitude: destinationLongitude,
        latitudeDelta: 0,
        longitudeDelta: 0,
      };
      const zoomInDestRegion = {
        ...destLoc,
        latitudeDelta: zoomInDelta,
        longitudeDelta: zoomInDelta,
      };
      const zoomOutDestRegion = {
        ...destLoc,
        latitudeDelta: zoomOutDelta,
        longitudeDelta: zoomOutDelta,
      };

      mapRef.current?.animateToRegion(zoomInDestRegion, duration);
      await wait(duration + delay);
      if (cancelled) return;

      mapRef.current?.animateToRegion(zoomOutDestRegion, duration);
      await wait(duration + delay);
      if (cancelled) return;

      // Fit both coordinates
      mapRef.current?.fitToCoordinates(
        [
          { latitude: userLatitude, longitude: userLongitude },
          { latitude: destinationLatitude, longitude: destinationLongitude },
        ],
        {
          edgePadding: {
            top: 100,
            right: 100,
            bottom: bottomOffset,
            left: 100,
          },
          animated: true,
        },
      );
    };

    animateSequence();

    return () => {
      cancelled = true;
    };
  }, [
    mapRef,
    mapReady,
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  ]);
};

export default useMapAnimations;
