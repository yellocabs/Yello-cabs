import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import Welcome from '@/screens/auth/welcome-screen'
import RoleScreen from '@/screens/common/role-screen'
import LoginScreen from '@/screens/auth/login-screen'


const Stack = createNativeStackNavigator()

const AuthNavigator = () => (
  <Stack.Navigator initialRouteName="Welcome">
    <Stack.Screen
      name="Welcome"
      component={Welcome}
      options={{ headerShown: false }}
    />  
    <Stack.Screen name="Login" options={{ headerShown: false }}>
      {(props) => (
        <LoginScreen  />
      )}
    </Stack.Screen>
    <Stack.Screen
      name="Role"
      component={RoleScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
)

export default AuthNavigator