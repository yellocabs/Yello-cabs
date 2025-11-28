import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from "@/types/navigation-types"; // your type file
import AuthNavigator from './auth-navigator';
import TabNavigator from './tab-navigator';
import DriverNavigator from './driver-navigator';
import RiderNavigator from './rider-navigator';

const Stack = createNativeStackNavigator();


const RootNavigator = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen name="Driver" component={DriverNavigator} />
        <Stack.Screen name="Rider" component={RiderNavigator} />
    </Stack.Navigator>
);


export default RootNavigator;
