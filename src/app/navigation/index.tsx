import React, { use, useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation-types';
import AuthNavigator from './auth-navigator';
import TabNavigator from './tab-navigator';
import DriverNavigator from './driver-navigator';
import RiderNavigator from './rider-navigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { useUserStore } from '@/store/use-user-store';
import { useAuthStore } from '@/store/auth-store';
import { WSProvider } from '@/services/WSProvider';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const [loading, setLoading] = useState(true);
  const { setToken } = useAuthStore();
  const { user, setUser } = useUserStore();
  const [initialRoute, setInitialRoute] =
    useState<keyof RootStackParamList>('Auth');

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        console.log('Token from nav:', token);
        const userStore = await AsyncStorage.getItem('user-store');
        console.log('store:', userStore);

        if (token && userStore) {
          console.log('hello from inside');
          const { state } = JSON.parse(userStore);
          console.log('state:', state);

          const storedUser = state.user;
          console.log('user:', storedUser);
          setToken(token);
          if (token) {
            setUser(storedUser);
            setInitialRoute(storedUser.role === 'captain' ? 'Driver' : 'Tabs');
          }
        }
      } catch (e) {
        console.log('Error checking token', e);
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FDB726" />
      </View>
    );
  }

  return (
    <WSProvider>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen name="Driver" component={DriverNavigator} />
        <Stack.Screen name="Rider" component={RiderNavigator} />
      </Stack.Navigator>
    </WSProvider>
  );
};

export default RootNavigator;
