import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Animated, Easing } from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';

import { useLocationStore, useDriverStore } from '@/store';
import useGenerateRandomMarkers from '@/hooks/useGenerateRandomMarkers';

import { FALLBACK_REGION } from './constants';
import UserMarker from './UserMarker';
import DriverMarkers from './DriverMarkers';
import DestinationMarker from './DestinationMarker';
import RouteAnimator from './RouteAnimator';
import RecenterButton from './RecenterButton';

import useMapAnimations from './useMapAnimations';
import { calculateRegion, calculateDriverTimes } from '@/libs/map';
import { customMapStyle } from '../../utils/CustomMap';
import { MarkerData } from '@/types/declare';

const Map: React.FC = () => {
  const mapRef = useRef<MapView | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
    destinationAddress,
  } = useLocationStore();

  const { selectedDriver, setDrivers } = useDriverStore();
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  useGenerateRandomMarkers(setMarkers);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation loop
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

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
        500,
      );
    }
  };

  // Trigger animations after map is ready
  useMapAnimations({
    mapRef,
    mapReady,
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  });

  // useEffect(() => {
  //   if (userLatitude && userLongitude && isFocused) {
  //     emit("subscribeToZone", {
  //       latitude: location.latitude,
  //       longitude: location.longitude,
  //     });

  //     on("nearbyRiders", (riders: any[]) => {
  //       const updatedMarkers = riders.map((rider) => ({
  //         id: rider.id,
  //         latitude: rider.coords.latitude,
  //         longitude: rider.coords.longitude,
  //         type: "rider",
  //         rotation: rider.coords.heading,
  //         visible: true,
  //       }));
  //       setMarkers(updatedMarkers);
  //     });
  //   }

  //   return () => {
  //     off("nearbyriders");
  //   };
  // }, [userLatitude , userLongitude, emit, on, off, isFocused]);
  const initialRegion = useMemo(
    () =>
      calculateRegion({
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
      }) || FALLBACK_REGION,
    [userLatitude, userLongitude, destinationLatitude, destinationLongitude],
  );

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (
        markers.length > 0 &&
        destinationLatitude &&
        destinationLongitude &&
        userLatitude &&
        userLongitude
      ) {
        try {
          const updated = await calculateDriverTimes({
            markers,
            userLatitude,
            userLongitude,
            destinationLatitude,
            destinationLongitude,
          });
          if (!cancelled) {
            setDrivers(updated as MarkerData[]);
          }
        } catch (e) {
          // optional: handle error
          console.warn('calculateDriverTimes err:', e);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [
    markers,
    destinationLatitude,
    destinationLongitude,
    userLatitude,
    userLongitude,
    setDrivers,
  ]);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={r => (mapRef.current = r)}
        provider={PROVIDER_DEFAULT}
        style={{ flex: 1 }}
        customMapStyle={customMapStyle}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsCompass={false}
        showsMyLocationButton={false}
        scrollEnabled
        zoomEnabled
        onMapReady={() => setMapReady(true)}
      >
        {userLatitude !== null && userLongitude !== null && (
          <UserMarker
            latitude={userLatitude}
            longitude={userLongitude}
            pulseAnim={pulseAnim}
          />
        )}
        {mapReady && (
          <DriverMarkers markers={markers} selectedDriver={selectedDriver} />
        )}
        {destinationLatitude !== null && destinationLongitude !== null && (
          <DestinationMarker
            latitude={destinationLatitude}
            longitude={destinationLongitude}
            destinationAddress={destinationAddress}
          />
        )}

        {/* Render route immediately — safe */}
        {mapReady &&
          userLatitude !== null &&
          userLongitude !== null &&
          destinationLatitude !== null &&
          destinationLongitude !== null && (
            <RouteAnimator
              userLatitude={userLatitude}
              userLongitude={userLongitude}
              destinationLatitude={destinationLatitude}
              destinationLongitude={destinationLongitude}
            />
          )}
      </MapView>

      <RecenterButton onPress={recenterMap} />
    </View>
  );
};

export default React.memo(Map);
