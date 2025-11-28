import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { View, useWindowDimensions, Image, TouchableOpacity, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet from "./bottom-sheet";
import { icons, onboarding } from "@/constants";
import { useNavigation } from "@react-navigation/native";
import Map from "@/components/map/Map";

import CustomIconButton from "./custom-icon-buttom";

interface RideLayoutProps {
  title: string
  h: number;
  minHeight: number
  children: React.ReactNode;
}

// We forward a ref so parent can call methods on this layout (e.g. goToNext)
const RideLayout = forwardRef<any, RideLayoutProps>(
  ({ title, children, h, minHeight }, ref) => {
    const { height } = useWindowDimensions();
    const bottomSheetRef = useRef<any>(null);
    const navigation = useNavigation();

    useEffect(() => {
      setTimeout(() => bottomSheetRef.current?.expand(), 200);
    }, []);

    useImperativeHandle(ref, () => ({
      expandTo(percent: number) {
        bottomSheetRef.current?.expandTo(percent);
      }
    }));


    return (
      <GestureHandlerRootView className="flex-1">
        <View className="flex-1 bg-white">

          {/* MAP */}
          <View className="absolute inset-0">
            <Map />
          </View>

          {/* HEADER */}
          <View className="flex flex-row absolute z-10 top-16 items-center px-5">

            {title !== "Home" && (
              <CustomIconButton
                icon={icons.left}
                size={45}
                bg="#fffce8"
                onPress={() => navigation.goBack()}
              />
            )}

            {/* <Text className="text-xl font-UrbanistSemiBold ml-5">{title}</Text> */}
          </View>

          <BottomSheet
            ref={bottomSheetRef}
            activeHeight={height * h}
            backgroundColor="#ffffff"
            showBackdrop={false}
            minHeight={minHeight}
          >
            {children}
          </BottomSheet>
        </View>
      </GestureHandlerRootView>
    );
  }
);


export default RideLayout;
