import React from 'react';
import {
  Text,
  Image,
  ImageSourcePropType,
  useWindowDimensions,
} from 'react-native';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { COLORS } from '@/assets/colors';

interface TabIconProps {
  source: ImageSourcePropType;
  label: string;
  focused: boolean;
}

const TabIcon = ({ source, label, focused }: TabIconProps) => {
  const { width } = useWindowDimensions();

  // Dynamic sizes
  const iconSize = width * 0.065;
  const containerWidth = focused ? width * 0.28 : width * 0.15;
  const textMargin = width * 0.02;

  // Animated container (width + background color)
  const animatedContainer = useAnimatedStyle(() => ({
    width: withTiming(containerWidth, { duration: 220 }),
    backgroundColor: withTiming(
      focused ? COLORS.PRIMARY.DEFAULT : COLORS.BRAND_WHITE,
      { duration: 250 },
    ),
  }));

  // Animated text (fade + slide)
  const animatedText = useAnimatedStyle(() => ({
    opacity: withTiming(focused ? 1 : 0, { duration: 200 }),
    transform: [
      { translateX: withTiming(focused ? 0 : -10, { duration: 200 }) },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          height: 50,
          borderRadius: 999,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 8,
          marginHorizontal: 4,
          backgroundColor: COLORS.BRAND_ACCENT.DEFAULT, // baseline color
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 4,
        },
        animatedContainer,
      ]}
    >
      {/* Icon */}
      <Image
        source={source}
        resizeMode="contain"
        style={{
          width: iconSize,
          height: iconSize,
          tintColor: COLORS.BRAND_BLACK,
        }}
      />

      {/* Label (only visible when focused) */}
      {focused && (
        <Animated.Text
          style={[
            {
              marginLeft: textMargin,
              fontSize: 13,
              fontWeight: '600',
              color: COLORS.BRAND_BLACK,
            },
            animatedText,
          ]}
        >
          {label}
        </Animated.Text>
      )}
    </Animated.View>
  );
};

export default TabIcon;
