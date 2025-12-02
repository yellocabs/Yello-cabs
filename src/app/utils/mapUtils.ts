import { useLocationStore } from '@/store/location-store';
const GOOGLE_API_KEY = 'AIzaSyAC8JJ79eaC8PjAdFpNImUTjpRuJXUcWMM'; // Replace with your key

export const getPlacesSuggestions = async (input: string) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${GOOGLE_API_KEY}`,
    );
    const data = await response.json();
    if (data.status === 'OK') {
      return data.predictions.map((prediction: any) => ({
        description: prediction.description,
        place_id: prediction.place_id,
        title: prediction.structured_formatting.main_text,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
};

export const getLatLong = async (placeId: string) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=${GOOGLE_API_KEY}`,
    );
    const data = await response.json();
    if (data.status === 'OK') {
      const { lat, lng } = data.result.geometry.location;
      return {
        latitude: lat,
        longitude: lng,
        address: data.result.formatted_address,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching lat/long:', error);
    return null;
  }
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export const fetchDistance = async () => {
  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
    setDistance,
    setDistanceText,
    setDuration, // <-- make sure this exists in your store
  } = useLocationStore.getState();

  if (
    !userLatitude ||
    !userLongitude ||
    !destinationLatitude ||
    !destinationLongitude
  ) {
    return;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${userLatitude},${userLongitude}&destinations=${destinationLatitude},${destinationLongitude}&key=AIzaSyAC8JJ79eaC8PjAdFpNImUTjpRuJXUcWMM`,
    );

    const data = await response.json();
    const element = data.rows?.[0]?.elements?.[0];

    if (element?.status === 'OK' && element.distance && element.duration) {
      // --- DISTANCE ---
      const meters = element.distance.value;
      const km = meters / 1000;
      const formattedDistance = `${km.toFixed(1)} km`; // 1286 → 1.3 km

      setDistanceText(formattedDistance);
      setDistance(km);

      // --- DURATION ---
      const seconds = element.duration.value;
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);

      const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}`;
      setDuration(formattedDuration);
    } else {
      setDistanceText('');
      setDistance(0);
      setDuration('00:00');
    }
  } catch (error) {
    setDistanceText('');
    setDistance(0);
    setDuration('00:00');
  }
};
