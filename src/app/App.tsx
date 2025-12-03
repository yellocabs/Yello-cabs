import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import 'react-native-gesture-handler';
import RootNavigator from './navigation';
import SplashScreen from './screens/common/splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { configureGoogleSignIn } from './services/google-auth';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import Toast from 'react-native-toast-message';

export default function App() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    configureGoogleSignIn();
  }, []);
  useEffect(() => {
    SystemNavigationBar.immersive();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000); // 2 sec custom splash
  }, []);

  if (loading) return <SplashScreen />;
  return (
    <SafeAreaProvider className="flex-1">
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" />
          <RootNavigator />
          <Toast />
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
