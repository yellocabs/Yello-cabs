import React from 'react';
import { Image } from 'react-native';
import CustomButton from '@/components/custom-button';
import { icons } from '@/constants';

type Props = {
  onPress: () => void;
};

const GoogleLoginButton = ({ onPress }: Props) => {
  return (
    <CustomButton
      title="Log in with Google"
      className="w-full h-12 rounded-2xl bg-brand-white border-2 border-general-300 shadow-none"
      IconLeft={() => (
        <Image
          source={icons.google}
          resizeMode="contain"
          className="w-5 h-5 mx-2"
        />
      )}
      bgVariant="outline"
      textVariant="primary"
      loading= {false}
      onPress={onPress}
    />
  );
};

export default GoogleLoginButton;
