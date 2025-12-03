import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from 'react';
import {
  View,
  useWindowDimensions,
  Image,
  TouchableOpacity,
  Text,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { icons, onboarding } from '@/constants';
import { useNavigation } from '@react-navigation/native';
import Map from '@/components/map';

import CustomIconButton from './shared/custom-icon-buttom';

interface RideLayoutProps {
  title: string;
  children: React.ReactNode;
  snapPoints?: (string | number)[];
}

// We forward a ref so parent can call methods on this layout (e.g. goToNext)
const RideLayout = forwardRef<any, RideLayoutProps>(
  ({ title, children, snapPoints = ['25%', '50%', '90%'] }, ref) => {
    const { height } = useWindowDimensions();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const navigation = useNavigation();

    useImperativeHandle(ref, () => ({
      expandTo(index: number) {
        bottomSheetRef.current?.snapToIndex(index);
      },
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
            {title !== 'Home' && (
              <CustomIconButton
                icon={icons.left}
                size={45}
                bg="#fffce8"
                onPress={() => navigation.goBack()}
              />
            )}

            {/* <Text className="text-xl font-UrbanistSemiBold ml-5">{title}</Text> */}
          </View>

          <BottomSheet ref={bottomSheetRef} index={1} snapPoints={snapPoints}>
            <BottomSheetView>{children}</BottomSheetView>
          </BottomSheet>
        </View>
      </GestureHandlerRootView>
    );
  },
);

export default RideLayout;
