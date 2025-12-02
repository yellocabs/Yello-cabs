import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface LocationInputProps {
  placeholder: string;
  type: 'pickup' | 'drop';
  value: string;
  onChangeText: (text: string) => void;
  onFocus: () => void;
}

const LocationInput: React.FC<LocationInputProps> = ({
  placeholder,
  type,
  value,
  onChangeText,
  onFocus,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {type === 'pickup' ? (
          <View style={styles.pickupIcon} />
        ) : (
          <View style={styles.dropIcon} />
        )}
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        placeholderTextColor="#888"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  pickupIcon: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'green',
  },
  dropIcon: {
    width: 10,
    height: 10,
    backgroundColor: 'red',
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
});

export default LocationInput;
