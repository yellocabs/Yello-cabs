import { Region } from 'react-native-maps';
import { Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

// --- Map API Key ---
export const DIRECTIONS_API_KEY = 'AIzaSyAC8JJ79eaC8PjAdFpNImUTjpRuJXUcWMM'; // Replace as needed

// --- Map styles ---
// export const RAPIDO_MAP_STYLE = [
//   { featureType: "poi", stylers: [{ visibility: "off" }] },
//   { featureType: "transit", stylers: [{ visibility: "off" }] },
//   { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
//   { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
//   { featureType: "landscape.man_made", stylers: [{ visibility: "off" }] },
//   { featureType: "road", elementType: "geometry", stylers: [{ color: "#ebebeb" }] },
//   { featureType: "water", elementType: "geometry", stylers: [{ color: "#a2daf2" }] },
// ];

// --- Fallback region ---
export const FALLBACK_REGION: Region = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

// --- Bottom panel offset ---
export const bottomPanelHeightRatio = 0.45;
export const bottomOffset = height * bottomPanelHeightRatio + 24;
