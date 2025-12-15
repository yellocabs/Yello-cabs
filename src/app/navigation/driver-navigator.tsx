import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RiderHome from '@/screens/rider/RiderHome';

const Stack = createNativeStackNavigator();

const RiderNavigator = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false }}
    initialRouteName="RiderHome"
  >
    <Stack.Screen name="RiderHome" component={RiderHome} />
  </Stack.Navigator>
);

export default RiderNavigator;
