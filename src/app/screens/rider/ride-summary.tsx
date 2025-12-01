import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import CustomButton from '@/components/custom-button';
import RideLayout from '@/components/ride-layout';
import { useNavigation } from '@react-navigation/native';
import { icons } from '@/constants';
import { useLocationStore } from '@/store';
import { fetchDistance } from '@/utils/mapUtils';
import FindOffers from './find-offer';

/* ---------------------------------------------- */
/* Center Icon Component                           */
/* ---------------------------------------------- */
const CenterIcon = ({ isOrigin }: any) => {
  if (isOrigin) {
    return (
      <View className="w-[30px] h-[30px] justify-center items-center relative">
        <View
          className="w-[25px] h-[25px] rounded-full border-2"
          style={{
            borderColor: '#FFC700',
            backgroundColor: '#FFC700',
          }}
        />
        <View className="w-2 h-2 bg-black rounded-full absolute" />
      </View>
    );
  }

  return (
    <View
      className="w-[25px] h-[25px] rounded-full justify-center items-center"
      style={{ backgroundColor: 'black' }}
    >
      <Text className="text-[#FFC700] text-[14px]">&#9679;</Text>
    </View>
  );
};

/* ---------------------------------------------- */
/* Location Row Component                          */
/* ---------------------------------------------- */
const LocationEntry = ({ title, address, isOrigin }) => {
  return (
    <View className="flex-row items-center mb-5">
      <View className="items-center mr-4 relative">
        <Image
          source={isOrigin ? icons.target : icons.pin}
          style={{ width: 18, height: 18, tintColor: '#FFB800' }}
        />

        {isOrigin && (
          <View
            className="absolute top-10 w-[2px] border-l-2 border-dashed"
            style={{ borderColor: '#D3D3D3', height: 45 }}
          />
        )}
      </View>

      <View className="flex-1">
        <Text className="text-[16px] font-JakartaSemiBold text-black">
          {title}
        </Text>
        <Text className="text-[14px] text-[#757575]">{address}</Text>
      </View>

      <TouchableOpacity className="w-[30px] h-[30px] justify-center items-center ml-2">
        <Image
          source={icons.edit}
          className="w-5 h-5"
          style={{ tintColor: '#FFB800' }}
        />
      </TouchableOpacity>
    </View>
  );
};

/* ---------------------------------------------- */
/* Main Component                                  */
/* ---------------------------------------------- */
const RideSummary = () => {
  const navigation = useNavigation();

  const {
    userAddress,
    destinationAddress,
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
    distance,
    duration, // ⬅️ GET distance directly
    distanceText,
  } = useLocationStore();

  useEffect(() => {
    fetchDistance(); // ⬅️ This sets global distance automatically
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude]);

  const handlePress = () => {
    navigation.navigate('FindOffer');
  };
  return (
    <RideLayout title="Distance" h={0.45} minHeight={0.45}>
      <View className="flex-1 bg-white rounded-2xl px-5 pt-3">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-[18px] font-JakartaSemiBold text-[#4A4A4A]">
            Distance
          </Text>

          <Text className="text-[18px] font-JakartaBold text-black">
            {distanceText || '-- km'}
          </Text>
        </View>

        <View className="h-[1px] bg-[#F0F0F0] mb-5" />

        {/* Locations */}
        <ScrollView style={{ flex: 1 }}>
          <View className="mb-12">
            <LocationEntry
              title="Pick up location"
              address={userAddress}
              isOrigin={true}
            />
            <LocationEntry
              title="Destination location"
              address={destinationAddress}
              isOrigin={false}
            />
          </View>
        </ScrollView>

        <View className="py-2">
          <CustomButton title="Continue to Order" onPress={handlePress} />
        </View>
      </View>
    </RideLayout>
  );
};

export default RideSummary;
