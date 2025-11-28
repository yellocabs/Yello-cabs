import { create } from "zustand";

type DriverMarker = {
  id: number;
  latitude: number;
  longitude: number;
  name?: string;
  distanceFromUser?: number; // km
  etaToDestination?: string;
  distanceToDestination?: string;
};

type DriverStore = {
  drivers: DriverMarker[];
  selectedDriver: number | null;

  setDrivers: (drivers: DriverMarker[]) => void;
  setSelectedDriver: (driverId: number) => void;
  clearSelectedDriver: () => void;
};

export const useDriverStore = create<DriverStore>((set) => ({
  drivers: [],
  selectedDriver: null,

  setDrivers: (drivers) => set({ drivers }),
  setSelectedDriver: (driverId) => set({ selectedDriver: driverId }),
  clearSelectedDriver: () => set({ selectedDriver: null }),
}));
