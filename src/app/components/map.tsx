import React, { useEffect, useRef, useState, memo } from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import MapView, { Marker, Region, PROVIDER_DEFAULT } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { useIsFocused } from '@react-navigation/native';

import { icons } from '@/constants';
import { calculateRegion } from '@/libs/map';
import { useRiderStore, useUserStore } from '@/store';
import useMapAnimation from '@/hooks/useMapAnimation';
import UserMarker from './map/UserMarker';
import { COLORS } from '@/assets/colors';

const { height } = Dimensions.get('window');

const FALLBACK_REGION: Region = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

// Replace with your own key or keep from env / config
const DIRECTIONS_API_KEY = 'AIzaSyAC8JJ79eaC8PjAdFpNImUTjpRuJXUcWMM'; // replace as needed

const CUSTOM_MAP_STYLE = [
  {
    elementType: 'geometry',
    stylers: [
      {
        color: COLORS.GENERAL[500],
      },
    ],
  },
  {
    elementType: 'labels.icon',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: COLORS.GRAY[300],
      },
    ],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: COLORS.GENERAL[500],
      },
    ],
  },
  {
    featureType: 'administrative.land_parcel',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: COLORS.GRAY[200],
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [
      {
        color: COLORS.GENERAL[300],
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: COLORS.GRAY[300],
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [
      {
        color: COLORS.GENERAL[700],
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: COLORS.GRAY[200],
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      {
        color: COLORS.BRAND_WHITE,
      },
    ],
  },
  {
    featureType: 'road.arterial',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: COLORS.GRAY[300],
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [
      {
        color: COLORS.GRAY[100],
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: COLORS.GRAY[300],
      },
    ],
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: COLORS.GRAY[200],
      },
    ],
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry',
    stylers: [
      {
        color: COLORS.GENERAL[700],
      },
    ],
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [
      {
        color: COLORS.GENERAL[300],
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      {
        color: COLORS.GENERAL[600],
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: COLORS.GRAY[200],
      },
    ],
  },
];

// Panel offset calculation (matches your previous logic)
const bottomPanelHeightRatio = 0.45;
const bottomOffset = height * bottomPanelHeightRatio + 40;

const Map: React.FC<any> = props => {
  const mapRef = useRef<MapView | null>(null);
  const isFocused = useIsFocused();

  // ensure map is ready before running animations
  const [mapReady, setMapReady] = useState(false);

  // Using your stores
  const { destination } = useUserStore();
  const destinationLatitude = destination?.latitude;
  const destinationLongitude = destination?.longitude;

  const { location: riderLocation } = useRiderStore();

  // Prioritize props over store for user location
  const userLatitude = props.latitude ?? riderLocation?.latitude;
  const userLongitude = props.longitude ?? riderLocation?.longitude;

  const [loading] = useState(false);
  const [error] = useState<null | string>(null);

  const { pulseAnim } = useMapAnimation(
    mapRef,
    mapReady,
    isFocused,
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
    bottomOffset,
  );

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

  if (loading || (!userLatitude && !userLongitude)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY.DEFAULT} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: COLORS.DANGER[600] }}>{error}</Text>
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
        customMapStyle={CUSTOM_MAP_STYLE}
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
          setMapReady(true);
        }}
        {...props}
      >
        {userLatitude && userLongitude && (
          <>
            {userLatitude !== null && userLongitude !== null && (
              <UserMarker
                latitude={userLatitude}
                longitude={userLongitude}
                pulseAnim={pulseAnim}
              />
            )}
            <Marker
              coordinate={{ latitude: userLatitude, longitude: userLongitude }}
            >
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnim }],
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: COLORS.WARNING[500],
                  borderWidth: 3,
                  borderColor: COLORS.BRAND_WHITE,
                  elevation: 6,
                  shadowColor: COLORS.BRAND_BLACK,
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                }}
              />
            </Marker>
          </>
        )}

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
                  style={{
                    width: 30,
                    height: 30,
                    tintColor: COLORS.DANGER[600],
                  }}
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
                strokeColor={COLORS.BRAND_BLACK}
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
            backgroundColor: COLORS.PRIMARY.DEFAULT,
            padding: 14,
            borderRadius: 40,
            elevation: 5,
            shadowColor: COLORS.BRAND_BLACK,
            shadowOpacity: 0.15,
            shadowRadius: 6,
          }}
        >
          <Image
            source={icons.crosshair}
            style={{ width: 26, height: 26, tintColor: COLORS.BRAND_BLACK }}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default memo(Map);
