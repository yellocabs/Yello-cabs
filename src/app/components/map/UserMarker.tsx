import { COLORS } from '@/assets/colors';
import { icons } from '@/constants';
import { useLocationStore } from '@/store';
import React from 'react';
import { Animated, Text, View, Image } from 'react-native'; // Added Image
import { Marker, Circle } from 'react-native-maps';

// Helper function to convert hex to rgba
const hexToRgba = (hex, opacity) => {
  let r = 0,
    g = 0,
    b = 0;
  // 3 digits
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  }
  // 6 digits
  else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

interface Props {
  latitude: number | null;
  longitude: number | null;
  // This prop will now control the outer pulse animation effect
  pulseAnim: Animated.Value;
}

const UserMarker: React.FC<Props> = ({ latitude, longitude, pulseAnim }) => {
  if (!latitude || !longitude) return null;

  const animatedPulseRadius = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 400], // Radius starts smaller and expands further
  });

  const animatedPulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.4, 0], // Fades out as it expands
  });

  // Size of the central profile image marker
  const MARKER_SIZE = 50;

  return (
    <>
      {/* LAYERED GLOW EFFECT:
        1. A subtle, large, static circle for the ambient glow.
      */}
      <Circle
        center={{ latitude, longitude }}
        radius={350} // Large, wide glow
        fillColor={hexToRgba(COLORS.PRIMARY.DEFAULT, 0.1)} // Very light yellow
        strokeWidth={0}
      />

      {/* 2. The primary, animated pulse circle (matches the image's expanding ring)
       */}
      <Circle
        center={{ latitude, longitude }}
        radius={200} // Base size for the mid-layer glow
        fillColor={hexToRgba(COLORS.PRIMARY.DEFAULT, 0.2)} // Soft gold fill
        strokeColor={hexToRgba(COLORS.PRIMARY.DEFAULT, 0.5)}
        strokeWidth={1}
      />

      {/* USER PROFILE MARKER */}
      <Marker coordinate={{ latitude, longitude }} anchor={{ x: 0.5, y: 0.5 }}>
        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              width: MARKER_SIZE,
              height: MARKER_SIZE,
              borderRadius: MARKER_SIZE / 2,
              backgroundColor: COLORS.BRAND_ACCENT.DEFAULT, // Background for border
              borderWidth: 3,
              borderColor: COLORS.BRAND_WHITE, // White border around the image
              overflow: 'hidden', // Ensures image stays within bounds
              shadowColor: COLORS.BRAND_BLACK,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 8,
            }}
          >
            <Image
              source={icons.taxi}
              style={{ width: '80%', height: '80%' }}
              // Fallback for image loading issues (optional but good practice)
              defaultSource={icons.taxi} // Replace with a local placeholder if available
            />
          </View>
        </View>
      </Marker>
    </>
  );
};

export default UserMarker;
