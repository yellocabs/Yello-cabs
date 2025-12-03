import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { ReactNativeModal } from 'react-native-modal';
import { icons } from '@/constants'; // adjust if your error icon lives elsewhere
import CustomButton from './shared/custom-button';

type ErrorModalProps = {
  isVisible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  onPrimaryAction?: () => void;
  primaryLabel?: string;
  secondaryLabel?: string;
};

const ErrorModal: React.FC<ErrorModalProps> = ({
  isVisible,
  title = 'Something went wrong',
  message,
  onClose,
  onPrimaryAction,
  primaryLabel = 'Try again',
  secondaryLabel = 'Close',
}) => {
  const handlePrimary = () => {
    if (onPrimaryAction) onPrimaryAction();
    else onClose();
  };

  return (
    <ReactNativeModal
      isVisible={isVisible}
      onBackdropPress={onClose}
      useNativeDriver
      backdropOpacity={0.45}
    >
      <View className="bg-brand-white rounded-3xl px-7 py-8">
        {/* Icon + Close */}
        <View className="flex-row justify-between items-start mb-2">
          <View className="w-12 h-12 rounded-2xl  items-center justify-center"></View>

          <TouchableOpacity
            onPress={onClose}
            className="w-12 h-12 rounded-2xl bg-danger-100 items-center justify-center"
          >
            <Image
              source={icons.close || icons.warning}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text className="text-3xl font-UrbanistExtraBold text-brand-black mb-2">
          {title}
        </Text>

        {/* Message */}
        <Text className="text-sm font-UrbanistMedium text-general-200 mb-6">
          {message}
        </Text>

        {/* Buttons */}
        <View className="flex-row justify-between gap-3">
          {/* Secondary */}
          <TouchableOpacity
            onPress={onClose}
            className="flex-1 h-11 rounded-2xl border border-general-300 items-center justify-center"
          >
            <Text className="text-sm font-UrbanistSemiBold text-general-200">
              {secondaryLabel}
            </Text>
          </TouchableOpacity>

          {/* Primary */}
          <CustomButton
            title={primaryLabel}
            onPress={handlePrimary}
            className="flex-1 h-11 rounded-2xl bg-danger-500"
            textVariant="default"
          />
        </View>

        {/* Subtle helper */}
        <Text className="mt-4 text-[11px] text-general-200 font-UrbanistLight text-center">
          If this keeps happening, please check your internet connection or try
          again later.
        </Text>
      </View>
    </ReactNativeModal>
  );
};

export default ErrorModal;
