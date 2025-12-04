import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FindOffers from '@/screens/customer/find-offer';
import MapScreen from '@/screens/customer/map-screen';
import FindRider from '@/screens/customer/find-rider';

const Stack = createNativeStackNavigator();

const RiderNavigator = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false }}
    initialRouteName="FindOffer" // 👈 add this
  >
    {/* <Stack.Screen name="notification" component={notification} /> */}
    {/*<Stack.Screen name="RideSummary" component={RideSummary} />*/}
    <Stack.Screen name="FindOffer" component={FindOffers} />
    <Stack.Screen name="FindRider" component={FindRider} />
    <Stack.Screen name="MapScreen" component={MapScreen} />
    {/* <Stack.Screen name="NotFound" component={NotFound} /> */}
  </Stack.Navigator>
);

export default RiderNavigator;
