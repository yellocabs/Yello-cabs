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

export const fetchDistance = async (
  mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving',
) => {
  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore.getState();

  if (
    !userLatitude ||
    !userLongitude ||
    !destinationLatitude ||
    !destinationLongitude
  ) {
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${
        userLatitude
      },${userLongitude}&destinations=${destinationLatitude},${destinationLongitude}&key=${GOOGLE_API_KEY}&mode=${mode}`,
    );

    const data = await response.json();
    const element = data.rows?.[0]?.elements?.[0];

    if (element?.status === 'OK' && element.distance && element.duration) {
      return {
        distance: element.distance.text,
        duration: element.duration.text,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching distance:', error);
    return null;
  }
};
export const calculateFare = (
  distance: number, // in km
  duration: number, // in minutes
  trafficLevel: number = 1,
  demandLevel: number = 1,
) => {
  if (!distance || !duration) {
    return { bike: 0, auto: 0, cabEconomy: 0, cabPremium: 0 };
  }

  const cityMultiplier = 1.1;

  const rateStructure = {
    bike: { baseFare: 10, perKmRate: 5, perMinRate: 0.5, minimumFare: 25 },
    auto: { baseFare: 15, perKmRate: 7, perMinRate: 0.7, minimumFare: 30 },
    cabEconomy: { baseFare: 20, perKmRate: 10, perMinRate: 1, minimumFare: 50 },
    cabPremium: {
      baseFare: 30,
      perKmRate: 15,
      perMinRate: 1.5,
      minimumFare: 70,
    },
  };

  const fareCalculation = ({
    baseFare,
    perKmRate,
    perMinRate,
    minimumFare,
  }: any) => {
    let calculatedFare =
      baseFare + distance * perKmRate + duration * perMinRate;

    calculatedFare *= trafficLevel;
    calculatedFare *= demandLevel;
    calculatedFare *= cityMultiplier;

    calculatedFare = Math.max(calculatedFare, minimumFare);

    // ceil only if decimal exists
    return calculatedFare % 1 !== 0
      ? Math.ceil(calculatedFare)
      : calculatedFare;
  };

  return {
    bike: fareCalculation(rateStructure.bike),
    auto: fareCalculation(rateStructure.auto),
    cabEconomy: fareCalculation(rateStructure.cabEconomy),
    cabPremium: fareCalculation(rateStructure.cabPremium),
  };
};
