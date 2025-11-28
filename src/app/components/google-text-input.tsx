import { useLocationStore } from "@/store/location-store";
import { GoogleInputProps } from "@/types/declare"; // Assuming this type is updated
import React, { useRef, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from "react-native-google-places-autocomplete";
import {
  ChevronDownIcon,
  ClockIcon,
  XMarkIcon,
} from "react-native-heroicons/outline";

import { icons } from "@/constants";

// Use the environment variable for the API key
const googlePlacesApiKey = "AIzaSyAC8JJ79eaC8PjAdFpNImUTjpRuJXUcWMM";

const GoogleTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
  onPressIn
}: GoogleInputProps) => {
  // --- Functionality from your first component ---
  const googlePlaceAutoCompleteRef = useRef<GooglePlacesAutocompleteRef>(null);
  const userLatitude = useLocationStore((state) => state.userLatitude);
  const userLongitude = useLocationStore((state) => state.userLongitude);
  const [inputValue, setInputValue] = useState<string>("");

  return (
     <View
      className={`flex flex-row items-center justify-center relative z-50 rounded-xl ${containerStyle}`}
    >
      <GooglePlacesAutocomplete
        placeholder="where to?"
        ref={googlePlaceAutoCompleteRef}
        fetchDetails={true}
        debounce={200}
        // --- Styling from your second component ---
        styles={{
          textInputContainer: {
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 20,
            marginHorizontal: 20,
            position: "relative",
            shadowColor: "#d4d4d4",
          },
          textInput: {
            backgroundColor: textInputBackgroundColor
              ? textInputBackgroundColor
              : "white",
            fontSize: 16,
            fontWeight: "600",
            marginTop: 5,
            width: "100%",
            borderRadius: 200,
            // paddingLeft: 30, 
            // paddingRight: 80, 
          },
          listView: {
            backgroundColor: textInputBackgroundColor
              ? textInputBackgroundColor
              : "white",
            position: "relative",
            top: 0,
            width: "100%",
            borderRadius: 10,
            shadowColor: "#d4d4d4",
            zIndex: 99,
          },
        }}
        // --- onPress handler from your second component ---
        onPress={(data, details = null) => {
          handlePress({
            latitude: details?.geometry.location.lat!,
            longitude: details?.geometry.location.lng!,
            address: data.description,
          });
          setInputValue(data.description);
        }}
        // --- Query logic (merged from both) ---
        query={{
          key: googlePlacesApiKey!,
          language: "en",
          location:
            userLatitude != null && userLongitude != null
              ? `${userLatitude},${userLongitude}`
              : undefined,

          radius: 10000,
        }}
        renderLeftButton={() => (
          <View className="justify-center items-center w-6 h-6">
            <Image
              source={icon ? icon : icons.search}
              className="w-6 h-6"
              resizeMode="contain"
              style={{ tintColor: "#000000" }}

            />
          </View>
        )}
        // --- renderRightButton from your first component (styled with Tailwind) ---
        renderRightButton={() => (
          <View className="flex-row items-center">
            {inputValue.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  googlePlaceAutoCompleteRef.current?.setAddressText("");
                  setInputValue("");
                }}
                className="px-1.5" // was moderateScale(5)
              >
                <XMarkIcon size={20} color="grey" />
              </TouchableOpacity>
            )}

          </View>
        )}
      textInputProps={{
  placeholderTextColor: "black",
  placeholder: initialLocation ?? "Where to ?",

  onFocus: () => {
    googlePlaceAutoCompleteRef.current?.setAddressText("");
    setInputValue("");
    onPressIn?.();   // <-- Safe call
  },

  onChangeText: (text) => setInputValue(text),
  value: inputValue,
}}


        predefinedPlaces={[]}
        keyboardShouldPersistTaps="always"
        minLength={1}
        listViewDisplayed="auto"
        enablePoweredByContainer={false}
        GooglePlacesDetailsQuery={{ fields: "geometry" }}
        onFail={(error) =>
          console.error("GooglePlacesAutocomplete error:", error)
        }
        timeout={5000}
      />
    </View>
  );
};

export default GoogleTextInput;