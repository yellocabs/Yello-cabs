import React from "react";
import { View, useWindowDimensions } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "@/screens/rider/home-screen";
import Service from "@/screens/rider/services-screen";
import History from "@/screens/rider/history-screen";
import Profile from "@/screens/rider/profile-screen";
import { icons } from "@/constants";
import TabIcon from "@/components/tab-icon";

const Tab = createBottomTabNavigator();

const CustomTabBarBackground = () => {
  const { width, height } = useWindowDimensions();

  return (
    <View
      style={{
        position: "absolute",
        left: width * 0.04, // 5% from left
        right: width * 0.06, // 5% from right
        bottom: height * 0.02, // 2% from bottom
        height: height * 0.09, // 9% of screen height
        borderRadius: (height * 0.09) / 2, // full round
        backgroundColor: "rgba(0,0,0,0.15)",
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    />
  );
};

const TabNavigator = () => {
  const { width, height } = useWindowDimensions();
  const activeColor = "rgba(255, 235, 59, 1)";

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          position: "absolute",
          height: height * 0.09,
          paddingHorizontal: width * 0.1, // 10% padding left/right
        },
        tabBarBackground: () => <CustomTabBarBackground />,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: "#6B7280",
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.home} label="Home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Services"
        component={Service}
        options={{
          title: "Services",
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.services} label="Services" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={History}
        options={{
          title: "Rides",
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.list} label="My Rides" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          title: "Me",
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.profile} label="Me" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
