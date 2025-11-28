import React, { forwardRef, useImperativeHandle } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { BlurView } from "@react-native-community/blur";

const SPRING = { damping: 20, stiffness: 160 };

interface BottomSheetProps {
  activeHeight?: number;
  backgroundColor?: string;
  children: React.ReactNode;
  showBackdrop?: boolean;
  backdropColor?: string;
  showBlur?: boolean;
  minHeight: number;
}

const BottomSheet = forwardRef<any, BottomSheetProps>(
  (
    {
      activeHeight = 400,
      backgroundColor = "#fff",
      children,
      showBackdrop = true,
      backdropColor = "rgba(0,0,0,0.5)",
      showBlur = false,
      minHeight,
    },
    ref
  ) => {
    // Safe positions
    const OPEN = 0;
    const CLOSED = activeHeight * minHeight;

    // Main animation value
    const translateY = useSharedValue(CLOSED);
    const panStart = useSharedValue(0);

    // ----------- Public Methods (Safe for Map Sync) -----------
    useImperativeHandle(ref, () => ({
      expand: () => {
        translateY.value = withSpring(OPEN, SPRING);
      },
      close: () => {
        translateY.value = withSpring(CLOSED, SPRING);
      },
      expandTo: (percent: number) => {
        const target = CLOSED - percent * CLOSED;
        translateY.value = withSpring(target, SPRING);
      },

      // ⭐ Instead of returning a number (error),
      // we return the SHARED VALUE itself (allowed).
      y: translateY,
    }));

    // ----------- Gesture Handling -----------
    const panGesture = Gesture.Pan()
      .onStart(() => {
        panStart.value = translateY.value;
      })
      .onUpdate((event) => {
        const next = panStart.value + event.translationY;
        translateY.value = Math.min(Math.max(next, OPEN), CLOSED);
      })
      .onEnd((event) => {
        const shouldClose =
          translateY.value > activeHeight * 0.4 || event.velocityY > 600;

        translateY.value = withSpring(shouldClose ? CLOSED : OPEN, SPRING);
      });

    // ----------- Animated UI Styles -----------
    const sheetStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
      opacity: interpolate(translateY.value, [OPEN, CLOSED], [1, 0]),
    }));

    // ----------- Render -----------
    return (
      <>
        {/* BACKDROP */}
        {showBackdrop && (
          <Animated.View
            style={[backdropStyle]}
            pointerEvents="box-none"
            className="absolute inset-0 z-40"
          >
            {showBlur ? (
              <BlurView style={{ flex: 1 }} blurType="light" blurAmount={10} />
            ) : (
              <View style={{ flex: 1, backgroundColor: backdropColor }} />
            )}
          </Animated.View>
        )}

        {/* BOTTOM SHEET */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            className="absolute left-0 right-0 bottom-[-50px] z-50 rounded-t-[35px] pt-3"
            style={[
              { height: activeHeight + 50, backgroundColor },
              sheetStyle,
            ]}
          >
            <View className="w-[50px] h-[5px] bg-gray-300 rounded-full self-center mb-3" />

            <View className="flex-1">{children}</View>
          </Animated.View>
        </GestureDetector>
      </>
    );
  }
);

export default BottomSheet;
