import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import MapView, { PROVIDER_DEFAULT } from "react-native-maps";

import { useLocationStore, useDriverStore } from "@/store";

import { RAPIDO_MAP_STYLE, FALLBACK_REGION } from "./constants";
import UserMarker from "./UserMarker";
import DriverMarkers from "./DriverMarkers";
import DestinationMarker from "./DestinationMarker";
import RouteAnimator from "./RouteAnimator";
import RecenterButton from "./RecenterButton";

import useMapAnimations from "./useMapAnimations";
import useDriverMarkerLogic from "./useDriverMarkerLogic";
import { calculateRegion } from "@/libs/map";

const Map: React.FC = () => {
  const mapRef = useRef<MapView | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  const { selectedDriver } = useDriverStore();
  const { markers, pulseAnim, recenterMap } = useDriverMarkerLogic({ mapRef });

  // Trigger animations after map is ready
  useMapAnimations({
    mapRef,
    mapReady,
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  });

  const initialRegion =
    calculateRegion({
      userLatitude,
      userLongitude,
      destinationLatitude,
      destinationLongitude,
    }) || FALLBACK_REGION;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={(r) => (mapRef.current = r)}
        provider={PROVIDER_DEFAULT}
        style={{ flex: 1 }}
        customMapStyle={RAPIDO_MAP_STYLE}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsCompass={false}
        showsMyLocationButton={false}
        scrollEnabled
        zoomEnabled
        onMapReady={() => setMapReady(true)}
      >
        <UserMarker
          latitude={userLatitude}
          longitude={userLongitude}
          pulseAnim={pulseAnim}
        />
        <DriverMarkers markers={markers} selectedDriver={selectedDriver} />
        <DestinationMarker
          latitude={destinationLatitude}
          longitude={destinationLongitude}
        />

        {/* Render route immediately — safe */}
        {mapReady && userLatitude && userLongitude && destinationLatitude && destinationLongitude && (
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

export default Map;
