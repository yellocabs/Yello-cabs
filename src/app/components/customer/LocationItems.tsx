import { icons } from '@/constants';
import React, { FC } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const LocationItem: FC<{
  item: any;
  onPress: () => void;
}> = ({ item, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      {/* Left Section */}
      <View style={styles.leftRow}>
        <Image source={icons.map_pin} style={styles.mapPinIcon} />

        <View style={{ width: '83%' }}>
          <Text numberOfLines={1} style={styles.title}>
            {item?.title}
          </Text>

          <Text numberOfLines={1} style={styles.description}>
            {item?.description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default LocationItem;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  mapPinIcon: {
    width: width * 0.06, // responsive icon size
    height: width * 0.06,
    marginRight: 10,
    resizeMode: 'contain',
  },

  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },

  description: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
    color: '#555',
  },

  heartIcon: {
    fontSize: 20,
    color: '#ccc',
    marginLeft: 10,
  },
});
