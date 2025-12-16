import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RiderHome from '@/screens/rider/RiderHome';
import DriverProfileScreen from '@/screens/rider/driverProfile';
import ActiveRideScreen from '@/screens/rider/ActiveRide';

const Stack = createNativeStackNavigator();

const RiderNavigator = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false }}
    initialRouteName="RiderHome"
  >
    <Stack.Screen name="RiderHome" component={RiderHome} />
    <Stack.Screen name="Profile" component={DriverProfileScreen} />
    <Stack.Screen name="ActiveRide" component={ActiveRideScreen} />
  </Stack.Navigator>
);

export default RiderNavigator;
