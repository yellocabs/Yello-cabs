import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation-types';
import AuthNavigator from './auth-navigator';
import TabNavigator from './tab-navigator';
import DriverNavigator from './driver-navigator';
import RiderNavigator from './rider-navigator';
import VehicleSelectionScreen from '@/screens/rider/vehicleSelection';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { useUserStore } from '@/store/use-user-store';
import { useAuthStore } from '@/store/auth-store';
import { WSProvider } from '@/services/WSProvider';
import { useDriverStore } from '@/store/driver-store';
import NoDriverFoundModal from '@/components/shared/no-driver-found-modal';
import CancelRideModal from '@/components/shared/CancelRideModal';

const Stack = createNativeStackNavigator<RootStackParamList>();

const DriverScreen = () => (
  <WSProvider>
    <DriverNavigator />
  </WSProvider>
);

const TabsScreen = () => (
  <WSProvider>
    <TabNavigator />
  </WSProvider>
);

const RootNavigator = () => {
  const [loading, setLoading] = useState(true);
  const { setToken } = useAuthStore();
  const { user, setUser } = useUserStore();

  // Fetch driver profile on rider login
  useEffect(() => {
    if (user && user.role === 'driver') {
      useDriverStore.getState().fetchDriverProfile();
    }
  }, [user]);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const userStore = await AsyncStorage.getItem('user-store');

        if (token && userStore) {
          const { state } = JSON.parse(userStore);
          const storedUser = state.user;
          setToken(token);
          if (storedUser) {
            setUser(storedUser);
          }
        }
      } catch (e) {
        console.log('Error checking token', e);
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, [setToken, setUser]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FDB726" />
      </View>
    );
  }

  return (
    <>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          user.role === 'driver' ? (
            <>
              <Stack.Screen
                name="VehicleSelection"
                component={VehicleSelectionScreen}
              />
              <Stack.Screen name="Driver" component={DriverScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Tabs" component={TabsScreen} />
              <Stack.Screen name="Rider" component={RiderNavigator} />
            </>
          )
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
      <CancelRideModal />
      <NoDriverFoundModal />
    </>
  );
};

export default RootNavigator;
