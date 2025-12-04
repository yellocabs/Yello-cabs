import { create } from 'zustand';

type MarkerData = {
  id: number;
  latitude: number;
  longitude: number;
  name?: string;
};
type DriverStore = {
  drivers: MarkerData[];
  selectedDriver: number | null;

  setDrivers: (drivers: MarkerData[]) => void;
  setSelectedDriver: (driverId: number) => void;
  clearSelectedDriver: () => void;
};
type LocationStore = {
  userLatitude: number | null;
  userLongitude: number | null;
  userAddress: string | null;

  destinationLatitude: number | null;
  destinationLongitude: number | null;
  destinationAddress: string | null;

  distance: number | null;
  distanceText: string | null;

  duration: string | null; // <-- NEW
  setDuration: (value: string) => void; // <-- NEW

  setUserLocation: (params: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;

  setDestinationLocation: (params: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;

  setDistance: (distance: number) => void;
  setDistanceText: (distanceText: string) => void;
};

export const useLocationStore = create<LocationStore>(set => ({
  userLatitude: null,
  userLongitude: null,
  userAddress: null,

  destinationLatitude: null,
  destinationLongitude: null,
  destinationAddress: null,

  distance: null,
  distanceText: null,

  duration: '00:00', // NEW
  setDuration: value => set({ duration: value }), // NEW

  setDistance: distance => set({ distance }),
  setDistanceText: distanceText => set({ distanceText }),

  setUserLocation: ({ latitude, longitude, address }) => {
    set({
      userLatitude: latitude,
      userLongitude: longitude,
      userAddress: address,
    });
  },

  setDestinationLocation: ({ latitude, longitude, address }) => {
    set({
      destinationLatitude: latitude,
      destinationLongitude: longitude,
      destinationAddress: address,
    });
  },
}));
