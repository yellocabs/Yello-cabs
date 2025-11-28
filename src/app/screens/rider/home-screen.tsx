import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import React, { useRef, useState } from "react";
import GoogleTextInput from "@/components/google-text-input";
import RideLayout from "@/components/ride-layout";
import LocationPermissionModal from "@/components/location-permission-modal";
import { useLocationStore } from "@/store/location-store";
import { useFetchLocation } from "@/hooks/useFetchLocation";
import { icons } from "@/constants";
import { useNavigation } from "@react-navigation/native";

// ------------------------------------------------------------------
// MOCK SAVED PLACES
// ------------------------------------------------------------------
const savedPlaces = [
  {
    id: "1",
    name: "Eleonora Hotel",
    address: "6 Glendale St, Worcester, MA 01604",
    distance: "2.9 km",
  },
  {
    id: "2",
    name: "Grand City Park",
    address: "307 Lilac Drive Munster, IN 46321",
    distance: "8.3 km",
  },
  {
    id: "3",
    name: "Mall Plaza",
    address: "8694 Essex St, Sunnyside, NY 11104",
    distance: "4.4 km",
  },
  {
    id: "4",
    name: "Hellana Restaurant",
    address: "39 Oakland St, Clementon, NJ 08021",
    distance: "2.5 km",
  },
];

// ------------------------------------------------------------------
// SAVED PLACE ITEM
// ------------------------------------------------------------------
const SavedPlaceItem = ({ item, onSelect }: any) => (
  <TouchableOpacity
    onPress={() => onSelect(item)}
    className="flex-row items-center justify-between px-6 py-3 border-b border-gray-100"
  >
    <View className="flex-row items-center flex-1">
      <View className="mr-3 w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
        <Image
          source={icons.clock}
          style={{ width: 24, height: 24, tintColor: "#868484" }}
          resizeMode="contain"
        />
      </View>

      <View className="flex-1">
        <Text className="text-base font-JakartaSemiBold text-gray-800">
          {item.name}
        </Text>
        <Text className="text-xs font-JakartaRegular text-gray-500">
          {item.address}
        </Text>
      </View>
    </View>

    <Text className="text-sm font-JakartaSemiBold text-gray-600">
      {item.distance}
    </Text>
  </TouchableOpacity>
);

// ------------------------------------------------------------------
// TWO ADDRESS INPUTS: FROM + TO
// ------------------------------------------------------------------
const TwoAddressInput = ({
  userAddress,
  destinationAddress,
  setUserLocation,
  setDestinationLocation,
  navigation,
}: any) => {
  const handleDestinationPress = (location: any) => {
    setDestinationLocation(location);
    setTimeout(() => {
      navigation.navigate("Rider", { screen: "FindRides" });
    }, 120);
  };

  return (
    <View className="flex-row items-start px-6 pt-4 pb-4">
      {/* LEFT ICONS */}
      <View className="items-center mr-4 mt-2">
        <Image
          source={icons.crosshair}
          style={{ width: 24, height: 24, tintColor: "#FFB800" }}
          resizeMode="contain"
        />

        <View className="w-0.5 h-14 my-1 border-r border-dashed border-gray-300" />

        <Image
          source={icons.pin}
          style={{ width: 24, height: 24, tintColor: "#FFB800" }}
          resizeMode="contain"
        />
      </View>

      {/* RIGHT INPUTS */}
      <View className="flex-1">
        <GoogleTextInput
          placeholder="From"
          initialLocation={userAddress || ""}
          containerStyle="bg-neutral-100 mb-4"
          textInputBackgroundColor="transparent"
          handlePress={setUserLocation}
          rightIcon={icons.target}
        />

        <GoogleTextInput
          placeholder="Destination"
          initialLocation={destinationAddress}
          containerStyle="bg-neutral-100"
          textInputBackgroundColor="transparent"
          handlePress={handleDestinationPress}
          rightIcon={icons.pin}
        />
      </View>
    </View>
  );
};

// ------------------------------------------------------------------
// EXPANDED SECTION UI
// ------------------------------------------------------------------
const ExpandedAddressSelector = ({
  userAddress,
  destinationAddress,
  setUserLocation,
  setDestinationLocation,
  navigation,
}: any) => {
  // When user taps a saved place entry
  const handleSavedPlacePress = (place: any) => {
    setDestinationLocation({
      description: place.address,
      placeName: place.name,
    });

    navigation.navigate("Rider", { screen: "FindRides" });
  };

  return (
    <>
      <Text className="text-xl font-JakartaBold text-center pt-3 pb-2 text-gray-900">
        Select Address
      </Text>

      <TwoAddressInput
        userAddress={userAddress}
        destinationAddress={destinationAddress}
        setUserLocation={setUserLocation}
        setDestinationLocation={setDestinationLocation}
        navigation={navigation}
      />

      <View className="h-2 bg-neutral-50 w-full" />

      {/* Saved Places Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <View className="flex-row items-center">
          <Image
            source={icons.bookmark}
            style={{ width: 24, height: 24, tintColor: "#FFB800" }}
            resizeMode="contain"
          />
          <Text className="text-base font-bold text-gray-800 ml-4">
            Saved Places
          </Text>
        </View>

        <Image
          source={icons.right}
          style={{ width: 16, height: 16, tintColor: "#FFB800" }}
          resizeMode="contain"
        />
      </View>

      <FlatList
        data={savedPlaces}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SavedPlaceItem item={item} onSelect={handleSavedPlacePress} />
        )}
        scrollEnabled={false}
      />
    </>
  );
};

// ------------------------------------------------------------------
// MAIN HOME SCREEN
// ------------------------------------------------------------------
const HomeScreen = () => {
  const navigation = useNavigation();
  const layoutRef = useRef<any>(null);
  const [suggestions, setSuggestions] = useState([]);
  const [expanded, setExpanded] = useState(false);

  const {
    userAddress,
    destinationAddress,
    setDestinationLocation,
    setUserLocation,
  } = useLocationStore();

  const {
    showPermissionModal,
    requestLocationPermission,
    dismissPermissionModal,
  } = useFetchLocation();

  const handleExpand = () => {
    if (!expanded) {
      setExpanded(true);
      layoutRef.current?.expandTo(0.9);
    }
  };

  return (
    <>
      {/* Location Permission Alert */}
      <LocationPermissionModal
        isVisible={showPermissionModal}
        onEnable={requestLocationPermission}
        onNotNow={dismissPermissionModal}
      />

      <RideLayout
        title="Home"
        ref={layoutRef}
        h={expanded ? 0.9 : 0.25}
        minHeight={0.4}
      >
        {!expanded ? (
          <View className="my-3 px-6">
            <GoogleTextInput
        
         icon={icons.target}
              initialLocation={destinationAddress}
              containerStyle="bg-neutral-100"
              textInputBackgroundColor="transparent"
              handlePress={setDestinationLocation}
              onPressIn={handleExpand}
        onSuggestionsFetched={(list) => setSuggestions(list)}  // <-- Receive list
      />
          </View>
        ) : (
          <ExpandedAddressSelector
            userAddress={userAddress}
            destinationAddress={destinationAddress}
            setUserLocation={setUserLocation}
            setDestinationLocation={setDestinationLocation}
            navigation={navigation}
          />
        )}
      </RideLayout>
    </>
  );
};

export default HomeScreen;
