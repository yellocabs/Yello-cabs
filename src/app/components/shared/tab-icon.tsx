import React from "react";
import { Text, Image, ImageSourcePropType, useWindowDimensions } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { View } from "react-native";
import { COLORS } from "@/constants";

interface TabIconProps {
  source: ImageSourcePropType;
  label: string;
  focused: boolean;
}

const TabIcon = ({ source, label, focused }: TabIconProps) => {
  const { width } = useWindowDimensions();

  // Define responsive sizes
  const iconSize = width * 0.065; // ~6.5% of screen width
  const containerWidth = focused ? width * 0.28 : width * 0.15; // expanded vs normal
  const textMargin = width * 0.02;

  const animatedContainer = useAnimatedStyle(() => ({
    width: withTiming(containerWidth, { duration: 250 }),
    backgroundColor: withTiming(focused ? COLORS.primary : "#ffff", { duration: 250 }),
  }));

  const animatedText = useAnimatedStyle(() => ({
    opacity: withTiming(focused ? 1 : 0, { duration: 200 }),
    transform: [
      { translateX: withTiming(focused ? 0 : -10, { duration: 200 }) },
    ],
  }));

  return (
    <Animated.View
      className="h-[50px] rounded-full flex-row items-center justify-center"
      style={[
        animatedContainer,
        {
          paddingHorizontal: 8,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 4,
          marginHorizontal: 4, // space between tabs
        },
      ]}
    >
      <Image
        source={source}
        resizeMode="contain"
        style={{ width: iconSize, height: iconSize, tintColor: "#000" }}
      />

      {focused && (
        <Animated.Text
          className="ml-2 text-sm font-semibold "
          style={[animatedText, { marginLeft: textMargin }]}
        >
          {label}
        </Animated.Text>
      )}
    </Animated.View>
  );
};

export default TabIcon;
