import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import MapView, {
  Marker,
  Region,
  Circle,
  PROVIDER_DEFAULT,
} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

import { icons } from '@/constants';
import useGenerateRandomMarkers from '@/hooks/useGenerateRandomMarkers';
import { calculateDriverTimes, calculateRegion } from '@/libs/map';
import { useDriverStore, useLocationStore } from '@/store';
import { MarkerData } from '@/types/declare';
import useMapAnimation from '@/hooks/useMapAnimation';

const { height } = Dimensions.get('window');

const FALLBACK_REGION: Region = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

// Replace with your own key or keep from env / config
const DIRECTIONS_API_KEY = 'AIzaSyAC8JJ79eaC8PjAdFpNImUTjpRuJXUcWMM'; // replace as needed

const RAPIDO_MAP_STYLE = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'road',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.land_parcel',
    stylers: [{ visibility: 'off' }],
  },
  { featureType: 'landscape.man_made', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ebebeb' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#a2daf2' }],
  },
];

// Dummy drivers (you had these earlier). If you load real drivers from store, replace this.
const drivers = [
  {
    id: 1,
    name: 'Alice',
    latitude: 37.78855,
    longitude: -122.431,
    vehicle: 'Sedan',
  },
  {
    id: 2,
    name: 'Bob',
    latitude: 37.7892,
    longitude: -122.4345,
    vehicle: 'Hatchback',
  },
  {
    id: 3,
    name: 'Charlie',
    latitude: 37.787,
    longitude: -122.433,
    vehicle: 'SUV',
  },
];

// Panel offset calculation (matches your previous logic)
const bottomPanelHeightRatio = 0.45;
const bottomOffset = height * bottomPanelHeightRatio + 24;

const Map: React.FC = () => {
  const mapRef = useRef<MapView | null>(null);

  // ensure map is ready before running animations
  const [mapReady, setMapReady] = useState(false);

  // Using your stores
  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  const { selectedDriver, setDrivers } = useDriverStore();

  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [loading] = useState(false);
  const [error] = useState<null | string>(null);
  useGenerateRandomMarkers(setMarkers);

  const { pulseAnim } = useMapAnimation(
    mapRef,
    mapReady,
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
    bottomOffset,
  );

  const hasRoute = !!(
    userLatitude &&
    userLongitude &&
    destinationLatitude &&
    destinationLongitude
  );

  // --- calculate ETA / driver times when markers & route exist ---
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

  // --- recenter helper ---
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
    } else if (mapRef.current) {
      mapRef.current.animateToRegion(FALLBACK_REGION, 500);
    }
  };

  // UI states
  if (loading || (!userLatitude && !userLongitude)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

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
        ref={r => {
          mapRef.current = r;
        }}
        provider={PROVIDER_DEFAULT}
        style={{ flex: 1 }}
        customMapStyle={RAPIDO_MAP_STYLE}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsTraffic={false}
        showsCompass={false}
        showsIndoors={false}
        showsBuildings={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        scrollEnabled={true}
        zoomEnabled={true}
        onMapReady={() => setMapReady(true)}
        onLayout={() => {
          // ensure mapReady is set if onMapReady missed for some reason
          setMapReady(true);
        }}
      >
        {/* User marker + pulse */}
        {userLatitude && userLongitude && (
          <>
            <Circle
              center={{ latitude: userLatitude, longitude: userLongitude }}
              radius={200}
              fillColor="rgba(255, 165, 0, 0.2)"
              strokeColor="rgba(255, 165, 0, 0.6)"
              strokeWidth={1}
            />
            <Marker
              coordinate={{ latitude: userLatitude, longitude: userLongitude }}
            >
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnim }],
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: '#FFA500',
                  borderWidth: 3,
                  borderColor: '#fff',
                  elevation: 6,
                  shadowColor: '#000',
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                }}
              />
            </Marker>
          </>
        )}

        {/* Driver markers */}
        {markers.map(m => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
          >
            <Image
              source={
                selectedDriver === +m.id ? icons.selectedMarker : icons.marker
              }
              style={{ width: 36, height: 36 }}
              resizeMode="contain"
            />
          </Marker>
        ))}

        {/* Destination + Route */}
        {destinationLatitude &&
          destinationLongitude &&
          userLatitude &&
          userLongitude && (
            <>
              <Marker
                coordinate={{
                  latitude: destinationLatitude,
                  longitude: destinationLongitude,
                }}
                style={{ width: 40, height: 40 }}
              >
                <Image
                  source={icons.pin}
                  style={{ width: 30, height: 30, tintColor: '#E91E63' }}
                  resizeMode="contain"
                />
              </Marker>

              <MapViewDirections
                origin={{ latitude: userLatitude, longitude: userLongitude }}
                destination={{
                  latitude: destinationLatitude,
                  longitude: destinationLongitude,
                }}
                apikey={DIRECTIONS_API_KEY}
                strokeColor="#000"
                strokeWidth={5}
                lineCap="round"
                lineJoin="round"
                onError={err => {
                  // optional logging, do not crash
                  console.warn('MapViewDirections error:', err);
                }}
              />
            </>
          )}
      </MapView>

      {/* Recenter button */}
      {userLatitude && userLongitude && (
        <TouchableOpacity
          onPress={recenterMap}
          style={{
            position: 'absolute',
            bottom: bottomOffset,
            right: 16,
            backgroundColor: '#fff',
            padding: 14,
            borderRadius: 40,
            elevation: 5,
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 6,
          }}
        >
          <Image
            source={icons.crosshair}
            style={{ width: 26, height: 26, tintColor: '#000' }}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Map;
