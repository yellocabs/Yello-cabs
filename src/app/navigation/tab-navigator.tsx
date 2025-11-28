import React from "react";
// We replace 'react-native' components with their 'tailwindcss-react-native' equivalents for NativeWind
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "@/screens/rider/home-screen";
import { icons } from "@/constants";
import TabIcon from "@/components/tab-icon";
import Service from "@/screens/rider/services-screen";
import History from "@/screens/rider/history-screen";
import Profile from "@/screens/rider/profile-screen";
import { useColorScheme } from "nativewind";

const Tab = createBottomTabNavigator();

const CustomTabBarBackground = () => {
  return (
    <View
      className="
        absolute left-8 right-8 bottom-10  
        h-[70px] rounded-full flex-row items-center justify-content
      "
      style={{
        backgroundColor: "rgba(0,0,0,0.15)",
        shadowOpacity: 0.12,
        shadowRadius: 10,
    
      }}
    />
  );
};



const TabNavigator = () => {
    // You might want to define the primary color in a constant or theme file
    const activeColor = "rgba(255, 235, 59, 1)"; // A clear yellow color

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
                    height: 90,
                    paddingHorizontal: 40, 
                }
                ,

                // 2. Custom Background View (The component that renders the visible white bar)
                tabBarBackground: () => <CustomTabBarBackground />,

                // 3. Color configuration for the TabIcon component (used inside TabIcon)
                tabBarActiveTintColor: activeColor,
                tabBarInactiveTintColor: "#6B7280", // Gray for inactive icons
            }}
        >
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    title: "Home",
                    tabBarIcon: ({ focused, color }) => (
                        // Pass the color from screenOptions to TabIcon for coloring
                        <TabIcon source={icons.home} label="Home" focused={focused} />
                    ),
                }}
            />
            <Tab.Screen
                name="Services"
                component={Service}
                options={{
                    title: "Services",
                    tabBarIcon: ({ focused, color }) => (
                        <TabIcon source={icons.services} label="Services" focused={focused}  />
                    ),
                }}
            />
            <Tab.Screen
                name="History"
                component={History}
                options={{
                    title: "Rides",
                    tabBarIcon: ({ focused, color }) => (
                        <TabIcon source={icons.list} label="My Rides" focused={focused}  />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={Profile}
                options={{
                    title: "Me",
                    tabBarIcon: ({ focused, color }) => (
                        <TabIcon source={icons.profile} label="Me" focused={focused}  />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator;