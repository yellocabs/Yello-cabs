import api from '../axiosInstance';

interface RidePosition {
  lat: string;
  long: string;
  adrs: string;
}

interface CreateRidePayload {
  startPosition: RidePosition;
  destinationPosition: RidePosition;
  fair: number;
  vehicleType: string;
}

export const createRide = (payload: CreateRidePayload) => {
  console.log('Creating ride with payload:', payload);
  return api.post('/api/rides/', payload);
};
