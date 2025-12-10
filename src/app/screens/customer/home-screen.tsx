import { View, Text, Image, useWindowDimensions } from 'react-native';
import React, { useRef, useState, useEffect, useMemo } from 'react';
import RideLayout from '@/components/customer/ride-layout';
import { useUserStore } from '@/store';
import { useFetchLocation } from '@/hooks/useFetchLocation';
import { icons } from '@/constants';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomButton from '@/components/shared/custom-button';
import LocationPermissionModal from '@/components/shared/location-permission-modal';
import GoogleTextInput from '@/components/customer/google-text-input';
import { useWS } from '@/services/WSProvider';

import { COLORS } from '@/assets/colors';

// ...

const TwoAddressInput = ({
  userAddress,
  destinationAddress,
  setLocation,
  setDestination,
  navigation,
  onPressIn,
}: any) => {
  const handleDestinationPress = (location: any) => {
    setDestination(location);
    console.log('destination');
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
          style={{ width: 24, height: 24, tintColor: COLORS.PRIMARY[500] }}
          resizeMode="contain"
        />

        <View
          style={{
            width: 0.5,
            height: 14,
            marginVertical: 1,
            borderRightWidth: 1,
            borderColor: COLORS.GRAY[100],
            borderStyle: 'dashed',
          }}
        />

        <Image
          source={icons.pin}
          style={{ width: 24, height: 24, tintColor: COLORS.PRIMARY[500] }}
          resizeMode="contain"
        />
      </View>
      {/* RIGHT INPUTS */}
      <View className="flex-1">
        <GoogleTextInput
          placeholder={userAddress ? userAddress : 'From'}
          initialLocation={userAddress || ''}
          containerStyle="bg-neutral-100 mb-4"
          textInputBackgroundColor="transparent"
          handlePress={setLocation}
          rightIcon={icons.target}
          onPressIn={onPressIn}
        />

        <GoogleTextInput
          placeholder="Where To?"
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
        <View
          style={{ flex: 1, height: 1, backgroundColor: COLORS.GRAY[100] }}
        />
        <Text style={{ marginHorizontal: 4, color: COLORS.TEXT.MUTED }}>
          Or
        </Text>
        <View
          style={{ flex: 1, height: 1, backgroundColor: COLORS.GRAY[100] }}
        />
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

const ExpandedAddressSelector = ({
  userAddress,
  destinationAddress,
  setLocation,
  setDestination,
  navigation,
  onPressIn,
}: any) => {
  return (
    <>
      <Text
        style={{ color: COLORS.TEXT.DEFAULT }}
        className="text-xl font-UrbanistBold text-center pt-3 pb-2"
      >
        Select Address
      </Text>

      <TwoAddressInput
        userAddress={userAddress}
        destinationAddress={destinationAddress}
        setLocation={setLocation}
        setDestination={setDestination}
        navigation={navigation}
        onPressIn={onPressIn}
      />
      <SelectOnMap />

      <View
        style={{ height: 8, backgroundColor: COLORS.BG.MUTED, width: '100%' }}
      />
    </>
  );
};

const HomeScreen = () => {
  const { height } = useWindowDimensions();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const layoutRef = useRef<any>(null);
  const [expanded, setExpanded] = useState(false);
  const snapPoints = useMemo(() => [height * 0.9, height * 0.9], [height]);

  const { user, destination, setDestination, setLocation, location } =
    useUserStore();

  const userAddress = location?.address;
  const destinationAddress = destination?.address;

  const {
    showPermissionModal,
    requestLocationPermission,
    dismissPermissionModal,
  } = useFetchLocation();

  const handleExpand = () => {
    layoutRef.current?.expandTo(1); // Snap to 90%
  };

  const handleSheetChanges = (index: number) => {
    if (index === 0) {
      setExpanded(false);
    } else {
      setExpanded(true);
    }
  };

  const handleTextInputPress = () => {
    handleExpand();
  };

  useEffect(() => {
    if (route.params?.params?.expanded) {
      handleExpand();
    }
    if (route.params?.location) {
      const { location, type } = route.params;
      if (type === 'destination') {
        setDestination(location);
      } else {
        setLocation(location);
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
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
      >
        {!expanded ? (
          <View className="my-3 px-6" style={{ height: height * 0.25 }}>
            <GoogleTextInput
              icon={icons.search}
              initialLocation={''}
              containerStyle="bg-neutral-100"
              textInputBackgroundColor="transparent"
              handlePress={setDestination}
              onPressIn={handleExpand}
            />
          </View>
        ) : (
          <ExpandedAddressSelector
            userAddress={userAddress}
            destinationAddress={destinationAddress}
            setLocation={setLocation}
            setDestination={setDestination}
            navigation={navigation}
            onPressIn={handleTextInputPress}
          />
        )}
      </RideLayout>
    </>
  );
};

export default HomeScreen;
