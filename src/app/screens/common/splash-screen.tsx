import { icons } from '@/constants';
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';


const SplashScreen = () => {
  return (
    <View className="flex-1 justify-center items-center bg-primary p-8">

      <View className="w-32 h-32 rounded-full bg-white justify-center items-center  shadow-xl">
        <Image className="w-16 h-16" source={icons.taxi} />


      </View>
      <View className="w-4 h-4 rounded-full bg-black " />
      <View className="w-1 h-12 bg-black z-100" />

      <View className="absolute top-[56%] w-full items-center">
        <View className="w-12 h-12 rounded-full bg-white justify-center items-center shadow-xl">

          <View className="items-center">
            <View className="w-4 h-4 rounded-full bg-black " />
          </View>

        </View>
      </View>


      <Text
        className="text-6xl text-black font-extrabold font-UrbanistBold mt-4"
      >
        YelloCabs
      </Text>

      <View className="absolute bottom-16 w-full items-center">
        <Text
          className="text-base text-black opacity-90 font-UrbanistMedium"
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
    <Text className="text-general-200 font-UrbanistMedium">
      Made in Bharat
    </Text>

</View>
    </View>
  );
};


export default SplashScreen;