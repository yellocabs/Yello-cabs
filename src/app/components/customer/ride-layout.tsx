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
import CustomIconButton from '../shared/custom-icon-buttom';

interface RideLayoutProps {
  title: string;
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  onChange?: (index: number) => void;
  initialIndex?: number;
}

// We forward a ref so parent can call methods on this layout (e.g. goToNext)
const RideLayout = forwardRef<any, RideLayoutProps>(
  ({ title, children, snapPoints, onChange, initialIndex = 0 }, ref) => {
    const { height } = useWindowDimensions();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const navigation = useNavigation();
    const [isSheetVisible, setIsSheetVisible] = useState(true);
    const interactionTimeout = useRef<NodeJS.Timeout | null>(null);

    useImperativeHandle(ref, () => ({
      expandTo(index: number) {
        bottomSheetRef.current?.snapToIndex(index);
      },
    }));

    const handlePanDrag = () => {
      if (interactionTimeout.current) {
        clearTimeout(interactionTimeout.current);
      }
      setIsSheetVisible(false);
    };

    const handleRegionChangeComplete = () => {
      if (interactionTimeout.current) {
        clearTimeout(interactionTimeout.current);
      }
      interactionTimeout.current = setTimeout(() => {
        setIsSheetVisible(true);
      }, 500);
    };

    useEffect(() => {
      if (isSheetVisible) {
        bottomSheetRef.current?.snapToIndex(initialIndex);
      } else {
        bottomSheetRef.current?.close();
      }
    }, [isSheetVisible, initialIndex]);

    return (
      <GestureHandlerRootView className="flex-1">
        <View className="flex-1 bg-white">
          {/* MAP */}
          <View className="absolute inset-0">
            <Map
              onPanDrag={handlePanDrag}
              onRegionChangeComplete={handleRegionChangeComplete}
            />
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

          <BottomSheet
            ref={bottomSheetRef}
            index={initialIndex}
            snapPoints={snapPoints}
            enablePanDownToClose={false}
            onChange={onChange}
          >
            <BottomSheetView>{children}</BottomSheetView>
          </BottomSheet>
        </View>
      </GestureHandlerRootView>
    );
  },
);

export default RideLayout;
