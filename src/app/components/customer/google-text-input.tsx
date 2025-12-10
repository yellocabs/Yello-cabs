import { useUserStore } from '@/store';
import { GoogleInputProps } from '@/types/declare';
import React, { useRef, useState } from 'react';
import { Dimensions, Image, TouchableOpacity, View } from 'react-native';
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from 'react-native-google-places-autocomplete';
import { XMarkIcon } from 'react-native-heroicons/outline';

import { icons } from '@/constants';
import LocationItem from './LocationItems';
import Config from 'react-native-config';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@/assets/colors';

const { width: screenWidth } = Dimensions.get('window');

const googlePlacesApiKey = 'AIzaSyAC8JJ79eaC8PjAdFpNImUTjpRuJXUcWMM';
console.log(googlePlacesApiKey);

const GoogleTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
  onPressIn,
  placeholder,
}: GoogleInputProps) => {
  const googlePlaceAutoCompleteRef = useRef<GooglePlacesAutocompleteRef>(null);
  const { location: userLocation } = useUserStore();
  const [inputValue, setInputValue] = useState<string>('');
  const navigation = useNavigation();

  const handleSuggestionPress = async (data: any, details: any = null) => {
    console.log('handleSuggestionPress');
    try {
      // The 'details' object is returned by the API when fetchDetails={true}
      if (details) {
        handlePress({
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng,
          address: data.description,
        });
        setInputValue(data.description);
        googlePlaceAutoCompleteRef.current?.setAddressText(data.description);
        googlePlaceAutoCompleteRef.current?.blur();
        setTimeout(() => {
          navigation.navigate('Rider', {
            screen: 'FindOffer',
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to fetch place details:', error);
    }
  };

  const getDetailsAndNavigate = async (data: any) => {
    try {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${data.place_id}&fields=geometry&key=${googlePlacesApiKey}`;
      const response = await fetch(detailsUrl);
      const json = await response.json();
      const details = json.result;
      console.log(details);
      handleSuggestionPress(data, details);
    } catch (error) {
      console.error('Failed to fetch place details:', error);
    }
  };

  return (
    <View
      className={`flex flex-row items-center justify-center relative z-50 rounded-xl ${containerStyle}`}
    >
      <GooglePlacesAutocomplete
        placeholder={placeholder ?? 'Where to?'}
        ref={googlePlaceAutoCompleteRef}
        debounce={400} // Increased debounce for cost optimization
        styles={{
          textInputContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
            marginHorizontal: 20,
            position: 'relative',
            shadowColor: COLORS.GRAY[100],
          },
          textInput: {
            backgroundColor: textInputBackgroundColor || COLORS.BRAND_WHITE,
            fontSize: 16,
            fontWeight: '600',
            marginTop: 5,
            width: '100%',
            borderRadius: 200,
          },
          listView: {
            backgroundColor: textInputBackgroundColor || COLORS.BRAND_WHITE,
            position: 'absolute',
            top: 60,
            width: screenWidth * 0.92,
            borderRadius: 10,
            shadowColor: COLORS.GRAY[100],
            zIndex: 9999,
            marginHorizontal: -screenWidth * 0.15,
          },
        }}
        renderRow={data => (
          <LocationItem
            item={{
              title: data.structured_formatting.main_text,
              description: data.structured_formatting.secondary_text,
            }}
            onPress={() => getDetailsAndNavigate(data)}
          />
        )}
        query={{
          key: googlePlacesApiKey!,
          language: 'en',
          location: `${userLocation?.latitude},${userLocation?.longitude}`,
          radius: '20000', // 20km radius
          rankby: 'distance',
          components: 'country:in', // Bias to India
        }}
        renderLeftButton={() => (
          <View className="justify-center items-center w-6 h-6">
            <Image
              source={icon || icons.search}
              className="w-6 h-6"
              resizeMode="contain"
              style={{ tintColor: COLORS.BRAND_BLACK }}
            />
          </View>
        )}
        renderRightButton={() => (
          <View className="flex-row items-center">
            {inputValue.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  googlePlaceAutoCompleteRef.current?.setAddressText('');
                  setInputValue('');
                }}
                className="px-1.5"
              >
                <XMarkIcon size={20} color={COLORS.GRAY[300]} />
              </TouchableOpacity>
            )}
          </View>
        )}
        textInputProps={{
          placeholderTextColor: COLORS.BRAND_BLACK,
          placeholder: placeholder
            ? placeholder
            : (initialLocation ?? 'Where to?'),
          onFocus: () => {
            googlePlaceAutoCompleteRef.current?.setAddressText('');
            setInputValue('');
            onPressIn?.();
          },
          onChangeText: text => setInputValue(text),
          value: inputValue,
        }}
        predefinedPlaces={[]}
        keyboardShouldPersistTaps="always"
        minLength={2}
        enablePoweredByContainer={false}
        onFail={error =>
          console.error('GooglePlacesAutocomplete error:', error)
        }
        onNotFound={() => console.log('No results found')}
      />
    </View>
  );
};

export default GoogleTextInput;
