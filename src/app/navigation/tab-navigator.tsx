import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '@/screens/rider/home-screen';
import Service from '@/screens/rider/services-screen';
import History from '@/screens/rider/history-screen';
import Profile from '@/screens/rider/profile-screen';
import { icons } from '@/constants';
import TabIcon from '@/components/tab-icon';

const Tab = createBottomTabNavigator();

const CustomTabBarBackground = () => {
  const { width, height } = useWindowDimensions();

  return (
    <View
      style={{
        position: 'absolute',
        left: '5%',
        right: '5%',
        bottom: height * 0.02,
        height: height * 0.09,
        borderRadius: (height * 0.09) / 2,
        backgroundColor: 'rgba(0,0,0,0.15)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  );
};

const TabNavigator = () => {
  const { width, height } = useWindowDimensions();
  const activeColor = 'rgba(255, 235, 59, 1)';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          position: 'absolute',
          height: height * 0.09,
          paddingHorizontal: width * 0.1,
        },
        tabBarBackground: () => <CustomTabBarBackground />,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.home} label="Home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Services"
        component={Service}
        options={{
          title: 'Services',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              source={icons.services}
              label="Services"
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={History}
        options={{
          title: 'Rides',
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.list} label="My Rides" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          title: 'Me',
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.profile} label="Me" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
