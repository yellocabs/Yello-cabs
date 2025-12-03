import { icons } from '@/constants';
import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image } from 'react-native';

export interface LocationProps  {
    isVisible:boolean
    onEnable: ()=>void
    onNotNow: ()=>void 
}
const LocationPermissionModal = ({ isVisible, onEnable, onNotNow }:LocationProps) => {
  if (!isVisible) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onNotNow}
    >
      <View className="flex-1 justify-center items-center bg-black/50 p-10">
        <View className="bg-white rounded-2xl w-full p-8 items-center shadow-lg">
          
          {/* Yellow Icon Header */}
          <View className="bg-yellow-100 rounded-full p-8 mb-10 mt-4">
            <View className="bg-yellow-500 rounded-full p-8">
              {/* This is a placeholder for a Location Pin icon */}
              <Image
              source={ icons.pin}
              className="w-10 h-10"
              resizeMode="contain"
              style={{ tintColor: "#000000" }}

            />
            </View>
          </View>

          {/* Title and Description */}
          <Text className="text-xl font-bold text-gray-900 mb-2">
            Enable Location
          </Text>
          <Text className="text-center text-gray-600 mb-8">
            We need access to your location to be able to use this service.
          </Text>
          
          {/* Buttons */}
          <TouchableOpacity
            className="w-full bg-yellow-500 py-4 rounded-xl mb-4"
            onPress={onEnable}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Enable Location
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full py-4 rounded-xl bg-yellow-50"
            onPress={onNotNow}
          >
            <Text className="text-gray-700 text-center font-semibold text-lg">
              Not Now
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

export default LocationPermissionModal;