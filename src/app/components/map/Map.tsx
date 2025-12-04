import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Animated, Easing } from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';

import { useLocationStore, useRiderStore } from '@/store';

import { FALLBACK_REGION } from './constants';
import UserMarker from './UserMarker';
import DestinationMarker from './DestinationMarker';
import RouteAnimator from './RouteAnimator';
import RecenterButton from './RecenterButton';

import useMapAnimations from './useMapAnimations';
import { calculateRegion } from '@/libs/map';
import { customMapStyle } from '../../utils/CustomMap';

const Map: React.FC = () => {
  const mapRef = useRef<MapView | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const { destinationLatitude, destinationLongitude, destinationAddress } =
    useLocationStore();

  const { location: riderLocation } = useRiderStore();
  const userLatitude = riderLocation?.latitude;
  const userLongitude = riderLocation?.longitude;

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
