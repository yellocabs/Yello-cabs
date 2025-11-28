import React, { useRef } from "react";
import { Animated } from "react-native";
import { Polyline } from "react-native-maps";

interface Props {
  coordinates: { latitude: number; longitude: number }[];
  progress: Animated.Value;
  strokeWidth?: number;
  strokeColor?: string;
}

const SmoothPolyline: React.FC<Props> = ({
  coordinates,
  progress,
  strokeWidth = 6,
  strokeColor = "#000",
}) => {
  if (!coordinates || coordinates.length < 2) return null;

  const dashLength = 10000; // arbitrary large number
  const animatedOffset = useRef(
    progress.interpolate({
      inputRange: [0, 1],
      outputRange: [dashLength, 0],
    })
  ).current;

  const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

  return (
    <AnimatedPolyline
      coordinates={coordinates}
      strokeWidth={strokeWidth}
      strokeColor={strokeColor}
      lineCap="round"
      strokeDasharray={[dashLength]}
      strokeDashoffset={animatedOffset}
    />
  );
};

export default SmoothPolyline;
