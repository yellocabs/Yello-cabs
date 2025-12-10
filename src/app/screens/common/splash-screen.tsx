import { icons } from '@/constants';
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS } from '@/assets/colors';

const SplashScreen = () => {
  return (
    <View
      style={{ backgroundColor: COLORS.PRIMARY.DEFAULT }}
      className="flex-1 justify-center items-center p-8"
    >
      <View
        style={{ backgroundColor: COLORS.BRAND_WHITE }}
        className="w-32 h-32 rounded-full justify-center items-center  shadow-xl"
      >
        <Image className="w-16 h-16" source={icons.taxi} />
      </View>
      <View
        style={{ backgroundColor: COLORS.BRAND_BLACK }}
        className="w-4 h-4 rounded-full"
      />
      <View
        style={{ backgroundColor: COLORS.BRAND_BLACK }}
        className="w-1 h-12 z-100"
      />

      <View className="absolute top-[56%] w-full items-center">
        <View
          style={{ backgroundColor: COLORS.BRAND_WHITE }}
          className="w-12 h-12 rounded-full justify-center items-center shadow-xl"
        >
          <View className="items-center">
            <View
              style={{ backgroundColor: COLORS.BRAND_BLACK }}
              className="w-4 h-4 rounded-full"
            />
          </View>
        </View>
      </View>

      <Text
        style={{ color: COLORS.BRAND_WHITE }}
        className="text-6xl font-extrabold font-UrbanistBold mt-4"
      >
        YelloCabs
      </Text>

      <View className="absolute bottom-16 w-full items-center">
        <Text
          style={{ color: COLORS.BRAND_WHITE, opacity: 0.9 }}
          className="text-base font-UrbanistMedium"
        >
          Making Every Ride Memorable
        </Text>
      </View>
      <View className="absolute bottom-8 w-full flex-row justify-center items-center">
        <Image
          source={require('@/assets/icons/flag.png')} // <-- ADD FLAG IMAGE HERE
          className="w-5 h-5 mr-2"
          resizeMode="contain"
        />
        <Text
          style={{ color: COLORS.GENERAL[200] }}
          className="font-UrbanistMedium"
        >
          Made in Bharat
        </Text>
      </View>
    </View>
  );
};

export default SplashScreen;
