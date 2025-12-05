import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import CustomButton from '@/components/custom-button';
import RideLayout from '@/components/ride-layout';
import { useNavigation, useRoute } from '@react-navigation/native';
import { icons } from '@/constants';
import { useLocationStore } from '@/store';
import { fetchDistance } from '@/utils/mapUtils';
import FindOffers from './find-offer';

/* ---------------------------------------------- */
/* Location Row Component                          */
/* ---------------------------------------------- */
const LocationEntry = ({ title, address, isOrigin, navigation }) => {
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

      <TouchableOpacity
        className="w-[30px] h-[30px] justify-center items-center ml-2"
        onPress={() =>
          navigation.navigate('Tabs', {
            screen: 'Home',
            params: { expanded: true },
          })
        }
      >
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

  const { userAddress, destinationAddress, distanceText } = useLocationStore();

  const handlePress = () => {
    setTimeout(() => {
      navigation.navigate('FindOffer');
    }, 120);
  };
  return (
    <RideLayout title="Distance" snapPoints={['45%', '60%', '90%']}>
      <View className="flex-1 bg-white rounded-2xl px-5 pt-3 pb-20">
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
        <ScrollView>
          <LocationEntry
            title="Pick up location"
            address={userAddress}
            isOrigin={true}
            navigation={navigation}
          />
          <LocationEntry
            title="Destination location"
            address={destinationAddress}
            isOrigin={false}
            navigation={navigation}
          />
        </ScrollView>

        <View className="absolute bottom-16 left-0 right-0 px-5 py-2 bg-white">
          <CustomButton title="Continue to Order" onPress={handlePress} />
        </View>
      </View>
    </RideLayout>
  );
};

export default RideSummary;
