import { View, Text, Image } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import RideLayout from '@/components/customer/ride-layout';
import { useLocationStore } from '@/store/location-store';
import { useFetchLocation } from '@/hooks/useFetchLocation';
import { icons } from '@/constants';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomButton from '@/components/shared/custom-button';
import LocationPermissionModal from '@/components/shared/location-permission-modal';
import GoogleTextInput from '@/components/customer/google-text-input';

// ------------------------------------------------------------------
// TWO ADDRESS INPUTS: FROM + TO
// ------------------------------------------------------------------
const TwoAddressInput = ({
  userAddress,
  destinationAddress,
  setUserLocation,
  setDestinationLocation,
  navigation,
  onPressIn,
}: any) => {
  const handleDestinationPress = (location: any) => {
    setDestinationLocation(location);
    setTimeout(() => {
      navigation.navigate('Rider', {
        screen: 'FindOffer',
        params: { location },
      });
    }, 120);
  };

  return (
    <View className="flex-row items-start px-6 pt-4 pb-4">
      {/* LEFT ICONS */}
      <View className="items-center mr-4 mt-2">
        <Image
          source={icons.crosshair}
          style={{ width: 24, height: 24, tintColor: '#FFB800' }}
          resizeMode="contain"
        />

        <View className="w-0.5 h-14 my-1 border-r border-dashed border-gray-300" />

        <Image
          source={icons.pin}
          style={{ width: 24, height: 24, tintColor: '#FFB800' }}
          resizeMode="contain"
        />
      </View>

      {/* RIGHT INPUTS */}
      <View className="flex-1">
        <GoogleTextInput
          placeholder="From"
          initialLocation={userAddress || ''}
          containerStyle="bg-neutral-100 mb-4"
          textInputBackgroundColor="transparent"
          handlePress={setUserLocation}
          rightIcon={icons.target}
          onPressIn={onPressIn}
        />

        <GoogleTextInput
          placeholder="Destination"
          initialLocation={destinationAddress}
          containerStyle="bg-neutral-100"
          textInputBackgroundColor="transparent"
          handlePress={handleDestinationPress}
          rightIcon={icons.pin}
          onPressIn={onPressIn}
        />
      </View>
    </View>
  );
};

const SelectOnMap = () => {
  const navigation = useNavigation<any>();
  return (
    <View className="px-6">
      <View className="flex-row items-center my-3">
        <View className="flex-1 h-px bg-gray-300" />
        <Text className="mx-4 text-gray-500">Or</Text>
        <View className="flex-1 h-px bg-gray-300" />
      </View>
      <CustomButton
        title="Select on Map"
        bgVariant="outline"
        textVariant="primary"
        onPress={() =>
          navigation.navigate('Rider', {
            screen: 'MapScreen',
            params: { type: 'destination' },
          })
        }
      />
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
  onPressIn,
}: any) => {
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
        onPressIn={onPressIn}
      />
      <SelectOnMap />

      <View className="h-2 bg-neutral-50 w-full" />
    </>
  );
};

// ------------------------------------------------------------------
// MAIN HOME SCREEN
// ------------------------------------------------------------------
const HomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const layoutRef = useRef<any>(null);
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
      layoutRef.current?.expandTo(2);
    }
  };

  const handleTextInputPress = () => {
    layoutRef.current?.expandTo(2);
  };

  useEffect(() => {
    if (route.params?.params?.expanded) {
      handleExpand();
    }
    if (route.params?.location) {
      const { location, type } = route.params;
      if (type === 'destination') {
        setDestinationLocation(location);
      } else {
        setUserLocation(location);
      }
    }
  }, [route.params]);

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
        snapPoints={expanded ? ['70%', '90%'] : undefined}
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
            />
          </View>
        ) : (
          <ExpandedAddressSelector
            userAddress={userAddress}
            destinationAddress={destinationAddress}
            setUserLocation={setUserLocation}
            setDestinationLocation={setDestinationLocation}
            navigation={navigation}
            onPressIn={handleTextInputPress}
          />
        )}
      </RideLayout>
    </>
  );
};

export default HomeScreen;
