import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import NotFound from "@/screens/common/not-found";
// import RideDetails from "@/screens/rider/ride-details-screen";
// import FindRides from "@/screens/rider/find-ride-screen";
import ConfirmRide from '@/screens/rider/ride-summary';
import FindOffers from '@/screens/rider/find-offer';
import FindRider from '@/screens/rider/find-rider';
// import BookRide from "@/screens/rider/book-ride-screen";
import MapScreen from '@/screens/rider/map-screen';
// import notification from "@/screens/rider/notification";

const Stack = createNativeStackNavigator();

const RiderNavigator = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false }}
    initialRouteName="ConfirmRides" // 👈 add this
  >
    {/* <Stack.Screen name="notification" component={notification} /> */}
    <Stack.Screen name="ConfirmRides" component={ConfirmRide} />
    <Stack.Screen name="FindOffer" component={FindOffers} />
    <Stack.Screen name="FindRider" component={FindRider} />
    <Stack.Screen name="MapScreen" component={MapScreen} />
    {/* <Stack.Screen name="NotFound" component={NotFound} /> */}
  </Stack.Navigator>
);

export default RiderNavigator;
