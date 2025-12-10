import React from 'react';
import { TouchableOpacity, View, Image } from 'react-native';

const CustomIconButton = ({ icon, size = 70, bg = '#1055c9', onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="items-center justify-center"
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        borderRadius: size * 0.3, // rounded like your image
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
      }}
    >
      <Image
        source={icon}
        style={{ width: size * 0.7, height: size * 0.7 }}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

export default CustomIconButton;
