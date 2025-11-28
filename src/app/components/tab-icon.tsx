import React from "react";
import { Text, Image, ImageSourcePropType } from "react-native";
import Animated, { 
  useAnimatedStyle, 
  withTiming 
} from "react-native-reanimated";
import { View } from "react-native";
import { COLORS } from "@/constants";

interface TabIconProps {
  source: ImageSourcePropType;     
  label: string;
  focused: boolean;
}

const TabIcon = ({ source, label, focused }:TabIconProps) => {

  const animatedContainer = useAnimatedStyle(() => {
    return {
      width: withTiming(focused ? 100 : 55, { duration: 250 }),
      backgroundColor: withTiming(focused ? COLORS.primary : "#ffffff", {
        duration: 250,
      }),
    };
  });

  const animatedText = useAnimatedStyle(() => {
    return {
      opacity: withTiming(focused ? 1 : 0, { duration: 200 }),
      transform: [
        {
          translateX: withTiming(focused ? 0 : -10, { duration: 200 }),
        },
      ],
    };
  });

  return (
    <Animated.View
      className="h-[50px] rounded-full flex-row items-center justify-center px-3"
      style={[
        animatedContainer,
        {
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 4,
        },
      ]}
    >
      <Image
        source={source}
        resizeMode="contain"
        className="w-6 h-6"
        style={{ tintColor: "#000" }}
      />

      {focused && (
        <Animated.Text
          className="ml-2 text-sm font-semibold text-black"
          style={animatedText}
        >
          {label}
        </Animated.Text>
      )}
    </Animated.View>
  );
};

export default TabIcon;
