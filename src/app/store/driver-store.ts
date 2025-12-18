import { create } from 'zustand';
import api from '@/api/axiosInstance';

interface DriverProfile {
  // Define the properties of the driver profile based on the API response
  // For now, let's assume it has at least these fields from the registration
  dlNumber: string;
  aadharNumber: string;
  // ... and more
}

interface DriverStoreState {
  driverProfile: DriverProfile | null;
  loading: boolean;
  error: string | null;
  fetchDriverProfile: () => Promise<void>;
}

export const useDriverStore = create<DriverStoreState>((set) => ({
  driverProfile: null,
  loading: false,
  error: null,
  fetchDriverProfile: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/api/riders/profile');
      if (response.data) {
        set({ driverProfile: response.data, loading: false });
      }
    } catch (error: any) {
      console.error('Failed to fetch driver profile:', error);
      set({ error: 'Failed to fetch profile', loading: false });
    }
  },
}));
