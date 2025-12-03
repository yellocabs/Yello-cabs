import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { View, useWindowDimensions, Image, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swiper from 'react-native-swiper';

import BottomSheet from '@/components/bottom-sheet';
import { icons, onboarding, bottomSheetData } from '@/constants';
import { useNavigation } from '@react-navigation/native';
import CustomIconButton from '@/components/shared/custom-icon-buttom';

const WelcomeScreen = forwardRef<any, any>(({ onIndexChange }, ref) => {
  const navigation = useNavigation<any>();
  const rootNav = navigation.getParent();

  const { height, width } = useWindowDimensions();

  // RESPONSIVE HELPERS
  const BASE_HEIGHT = 844;
  const BASE_WIDTH = 390;
  const vScale = height / BASE_HEIGHT;
  const hScale = width / BASE_WIDTH;
  const moderate = (s: number) => s * ((hScale + vScale) / 2);

  const swiperRef = useRef<any>(null);
  const bottomSheetRef = useRef<any>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const isLastSlide = activeIndex === onboarding.length - 1;

  // --- REMOVED ALL ANIMATION LOGIC ---
  // ------------------------------------

  useImperativeHandle(ref, () => ({
    goToNext() {
      if (isLastSlide) navigation.replace('Role');
      else swiperRef.current?.scrollBy(1);
    },
  }));

  useEffect(() => {
    setTimeout(() => bottomSheetRef.current?.expand(), 200);
  }, []);

  const handleNext = () => {
    if (isLastSlide) navigation.replace('Role');
    else swiperRef.current?.scrollBy(1);
  };

  const handleSkip = () => {
    rootNav?.reset({
      index: 2,
      routes: [{ name: 'Tabs', params: { screen: 'Home' } }],
    });
  };

  const currentSlide = bottomSheetData[activeIndex];
  const sheetLast = activeIndex === bottomSheetData.length - 1;

  const SlideContent = ({ data }: any) => (
    <View
      style={{
        flex: 1,
        paddingHorizontal: moderate(20),
        paddingVertical: moderate(25),
        justifyContent: 'space-between',
      }}
    >
      <View>
        <Text
          style={{
            fontSize: moderate(34),
            fontFamily: 'UrbanistExtraBold',
            color: '#000',
            lineHeight: moderate(45),
          }}
        >
          {data?.title}
        </Text>

        <Text
          style={{
            fontSize: moderate(30),
            fontFamily: 'UrbanistExtraBold',
            color: '#000',
            marginBottom: moderate(10),
          }}
        >
          {data?.subtitle}
        </Text>

        <Text
          style={{
            fontSize: moderate(15),
            fontFamily: 'UrbanistRegular',
            color: '#444',
          }}
        >
          {data?.description}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          gap: moderate(12),
          marginBottom: moderate(60),
        }}
      >
        <CustomButton
          title="Skip"
          onPress={handleSkip}
          bgVariant="bg-gray-200"
          textVariant="primary"
          rounded="xl"
          height="h-14"
          flex
        />

        <CustomButton
          title={sheetLast ? 'Get Started' : 'Next'}
          onPress={handleNext}
          bgVariant="primary"
          textVariant="primary"
          rounded="xl"
          height="h-14"
          flex
        />
      </View>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: '#f0bd1a' }}>
        {/* TOP ICON */}
        <View
          style={{
            position: 'absolute',
            top: height * 0.06,
            left: width * 0.05,
            zIndex: 99,
          }}
        >
          <CustomIconButton
            icon={icons.rider}
            size={moderate(45)}
            bg="#ffe592"
            onPress={handleNext}
          />
        </View>

        {/* SWIPER */}
        <Swiper
          ref={swiperRef}
          loop={false}
          onIndexChanged={index => {
            setActiveIndex(index);
            onIndexChange?.(index);
          }}
          dot={
            <View
              style={{
                width: 10,
                height: 10,
                margin: 3,
                backgroundColor: 'rgba(255,255,255,0.4)',
                borderRadius: 50,
              }}
            />
          }
          activeDot={
            <View
              style={{
                width: 35,
                height: 10,
                margin: 3,
                backgroundColor: '#fff',
                borderRadius: 50,
              }}
            />
          }
          paginationStyle={{
            position: 'absolute',
            top: height * 0.07,
            right: width * 0.07,
            bottom: undefined,
            left: undefined,
          }}
        >
          {onboarding.map(item => {
            // ----------------------------------------------
            // CONDITIONAL IMAGE CONTAINER + IMAGE STYLES
            // ----------------------------------------------
            let containerStyle: any = {};
            let imageStyle: any = {};
            <View></View>;
            if (item.id === 1) {
              containerStyle = {
                marginBottom: height * 0.2,
              };
              imageStyle = {
                width: width * 1,
                height: height * 0.47,
              };
            } else if (item.id === 2) {
              containerStyle = {
                marginBottom: height * 0.12,
                justifyContent: 'flex-start',
                alignSelf: 'center',
              };
              imageStyle = {
                width: width * 1.2,
                height: height * 0.6,
                alignSelf: 'center',
              };
            } else if (item.id === 3) {
              containerStyle = {
                marginBottom: height * 0.09,
              };
              imageStyle = {
                width: width * 1,
                height: height * 0.45,
              };
            }

            return (
              <View
                key={item.id}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden',
                }}
              >
                <View style={containerStyle}>
                  <Image
                    source={item.image}
                    resizeMode="contain"
                    style={imageStyle}
                  />
                </View>
              </View>
            );
          })}
        </Swiper>

        {/* BOTTOM SHEET */}
        <BottomSheet
          ref={bottomSheetRef}
          activeHeight={height * 0.38}
          minHeight={0.38}
          backgroundColor="#fff"
          showBackdrop={false}
        >
          <SlideContent data={currentSlide} />
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
});

export default WelcomeScreen;
