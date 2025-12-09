import { Driver, MarkerData } from '@/types/declare';

const directionsAPI = 'AIzaSyAC8JJ79eaC8PjAdFpNImUTjpRuJXUcWMM';

export const generateMarkersFromData = ({
  data,
  userLatitude,
  userLongitude,
}: {
  data: Driver[];
  userLatitude: number;
  userLongitude: number;
}): MarkerData[] => {
  return data.map(driver => {
    const latOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005
    const lngOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005

    return {
      latitude: userLatitude + latOffset,
      longitude: userLongitude + lngOffset,
      title: `${driver.first_name} ${driver.last_name}`,
      ...driver,
    };
  });
};

export const calculateRegion = ({
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
}) => {
  if (!userLatitude || !userLongitude) {
    return {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  if (!destinationLatitude || !destinationLongitude) {
    return {
      latitude: userLatitude,
      longitude: userLongitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  const minLat = Math.min(userLatitude, destinationLatitude);
  const maxLat = Math.max(userLatitude, destinationLatitude);
  const minLng = Math.min(userLongitude, destinationLongitude);
  const maxLng = Math.max(userLongitude, destinationLongitude);

  const latitudeDelta = (maxLat - minLat) * 1.3; // Adding some padding
  const longitudeDelta = (maxLng - minLng) * 1.3; // Adding some padding

  const latitude = (userLatitude + destinationLatitude) / 2;
  const longitude = (userLongitude + destinationLongitude) / 2;

  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta,
  };
};

export const calculateDriverTimes = async (driverLocations, destination) => {
  try {
    if (!destination?.latitude || !destination?.longitude) {
      return []; // no destination → no ETA
    }

    const results = [];

    for (const driver of driverLocations) {
      const origin = `${driver.latitude},${driver.longitude}`;
      const dest = `${destination.latitude},${destination.longitude}`;

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&mode=driving&key=${directionsAPI}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!data?.routes?.length || !data.routes[0]?.legs?.length) {
        console.warn('No route found for driver', driver);
        continue;
      }

      results.push({
        driverId: driver.id,
        eta: data.routes[0].legs[0].duration.text,
        distance: data.routes[0].legs[0].distance.text,
      });
    }

    return results;
  } catch (error) {
    console.error('Error calculating driver times:', error);
    return [];
  }
};
