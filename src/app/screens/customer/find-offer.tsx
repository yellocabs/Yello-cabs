import { createRide } from '@/api/end-points/ride';
import { icons } from '@/constants';
import { useEffect, useMemo, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUserStore } from '@/store';
import { calculateFare, fetchDistance } from '@/utils/mapUtils';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { ZapIcon } from 'lucide-react-native';
import CustomButton from '@/components/shared/custom-button';
import RideLayout from '@/components/customer/ride-layout';
import { COLORS } from '@/assets/colors';
import ErrorModal from '@/components/shared/error-modal';

// --- ICONS ---
const BikeIcon = () => (
  <Image
    source={icons.bike}
    style={{ width: 50, height: 50 }}
    resizeMode="contain"
  />
);
const AutoIcon = () => (
  <Image
    source={icons.auto}
    style={{ width: 50, height: 50 }}
    resizeMode="contain"
  />
);
const CabIcon = () => (
  <Image
    source={icons.cab}
    style={{ width: 50, height: 50 }}
    resizeMode="contain"
  />
);
const CabPremiumIcon = () => (
  <Image
    source={icons.cab_premium}
    style={{ width: 50, height: 50 }}
    resizeMode="contain"
  />
);

const IconWrapper = ({ children }) => (
  <View className="w-10 h-10 flex items-center justify-center">{children}</View>
);

// --- FORMAT PRICE ---
const formatPrice = (p: number) => (Number.isInteger(p) ? p : p.toFixed(2));

// --- RIDE CARD ---
const RideCard = ({ item, selected, onSelect, price, setPrice }) => {
  const isSelected = selected === item.type;

  return (
    <TouchableOpacity
      onPress={() => onSelect(item.type)}
      className="rounded-2xl mb-5"
      style={{
        backgroundColor: isSelected
          ? COLORS.PRIMARY.DEFAULT
          : COLORS.BRAND_WHITE,
        padding: 18,
        borderColor: COLORS.GENERAL[100],
        borderWidth: 0.3,
        shadowOpacity: 0.5,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <View className="flex-row items-center">
        <IconWrapper>{item.icon}</IconWrapper>

        <View className="flex-1 ml-3">
          <Text className="text-xl font-semibold text-black">{item.title}</Text>
          <Text style={{ color: COLORS.TEXT.MUTED }}>{item.time} away</Text>
          <Text style={{ color: COLORS.TEXT.MUTED }}>{item.dropTime}</Text>
        </View>

        {!isSelected && (
          <Text
            style={{ color: COLORS.TEXT.DEFAULT }}
            className="text-lg font-bold"
          >
            ₹{formatPrice(item.price)}
          </Text>
        )}
      </View>

      {isSelected && (
        <View className="items-center">
          <View
            style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
            className="flex-row items-center rounded-full px-4 py-2 mt-3"
          >
            <TouchableOpacity
              onPress={() => setPrice(p => Math.max(20, p - 5))}
              className="w-10 h-10 rounded-full bg-[#555] flex items-center justify-center"
            >
              <Text
                style={{ color: COLORS.BRAND_WHITE }}
                className="text-2xl font-bold"
              >
                -
              </Text>
            </TouchableOpacity>

            <Text
              style={{ color: COLORS.BRAND_WHITE }}
              className="mx-6 text-3xl font-bold"
            >
              ₹{formatPrice(price)}
            </Text>

            <TouchableOpacity
              onPress={() => setPrice(p => p + 5)}
              className="w-10 h-10 rounded-full bg-[#555] flex items-center justify-center"
            >
              <Text
                style={{ color: COLORS.BRAND_WHITE }}
                className="text-2xl font-bold"
              >
                +
              </Text>
            </TouchableOpacity>
          </View>

          <Text
            style={{ color: COLORS.TEXT.DEFAULT }}
            className="mt-2 line-through"
          >
            Recommended fare: ₹{formatPrice(item.price)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
const ToggleSwitch = ({ isActive, onToggle }) => {
  const trackColor = isActive ? COLORS.PRIMARY.DEFAULT : COLORS.GENERAL[100];
  const thumbColor = isActive ? COLORS.BRAND_BLACK : COLORS.GRAY[300];

  return (
    <TouchableOpacity
      onPress={onToggle}
      className="w-12 h-7 rounded-full p-0.5"
      style={{ backgroundColor: trackColor }}
    >
      <View
        className="w-6 h-6 rounded-full"
        style={{
          backgroundColor: thumbColor,
          transform: [{ translateX: isActive ? 20 : 0 }],
        }}
      />
    </TouchableOpacity>
  );
};
// --- MAIN ---
export default function FindOffers() {
  const [isAutoAccept, setIsAutoAccept] = useState(false);
  const [price, setPrice] = useState(0);
  const [selected, setSelected] = useState('bike');
  const [loading, setLoading] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [durations, setDurations] = useState({
    bike: '',
    auto: '',
    cabEconomy: '',
    cabPremium: '',
  });
  const [farePrices, setFarePrices] = useState({
    bike: 0,
    auto: 0,
    cabEconomy: 0,
    cabPremium: 0,
  });
  const { location, destination, setDestination } = useUserStore();

  const navigation = useNavigation();
  const route = useRoute<any>();

  const [distance, setDistance] = useState(0);

  // READABLE DATE FORMAT
  const getDropTime = (duration: string) => {
    if (!duration) return '';
    const now = new Date();
    const minutes = parseInt(duration, 10) || 0;
    now.setMinutes(now.getMinutes() + minutes);
    return `Drop ${now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  // Handle selecting location
  useEffect(() => {
    if (route.params?.location) {
      setDestination(route.params.location);
    }
  }, [route.params?.location]);

  // Fetch durations + distance from Google
  useEffect(() => {
    const load = async () => {
      if (!destination || !location) return;
      const bike = await fetchDistance(
        {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        {
          latitude: destination.latitude,
          longitude: destination.longitude,
        },
        'bicycling',
      );
      const driving = await fetchDistance(
        {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        {
          latitude: destination.latitude,
          longitude: destination.longitude,
        },
        'driving',
      );

      setDurations({
        bike: bike?.duration || '',
        auto: driving?.duration || '',
        cabEconomy: driving?.duration || '',
        cabPremium: driving?.duration || '',
      });

      if (driving?.distance) {
        const km = parseFloat(driving.distance.replace(' km', ''));
        setDistance(km);
      }
    };

    if (destination?.latitude && destination?.longitude) load();
  }, [destination, location]);

  // ---- CALCULATE FARE (PASS DURATION TOO) ----
  useEffect(() => {
    if (!distance || !durations.auto) return;

    const durationNumber = parseInt(durations.auto, 10) || 0;

    console.log('distance', distance);
    console.log('durationNumber', durationNumber);

    const fares = calculateFare(distance, durationNumber);

    setFarePrices({
      bike: fares.bike,
      auto: fares.auto,
      cabEconomy: fares.cabEconomy,
      cabPremium: fares.cabPremium,
    });
  }, [distance, durations]);

  // Create ride options
  const rideOptions = useMemo(
    () => [
      {
        type: 'bike',
        title: 'Moto',
        icon: <BikeIcon />,
        time: durations.bike,
        dropTime: getDropTime(durations.bike),
        price: farePrices.bike,
      },
      {
        type: 'auto',
        title: 'Auto',
        icon: <AutoIcon />,
        time: durations.auto,
        dropTime: getDropTime(durations.auto),
        price: farePrices.auto,
      },
      {
        type: 'Cab Economy',
        title: 'Cab Economy',
        icon: <CabIcon />,
        time: durations.cabEconomy,
        dropTime: getDropTime(durations.cabEconomy),
        price: farePrices.cabEconomy,
      },
      {
        type: 'Cab Premium',
        title: 'Cab Premium',
        icon: <CabPremiumIcon />,
        time: durations.cabPremium,
        dropTime: getDropTime(durations.cabPremium),
        price: farePrices.cabPremium,
      },
    ],
    [farePrices, durations],
  );

  // Auto update selected price
  useEffect(() => {
    const opt = rideOptions.find(o => o.type === selected);
    if (opt) setPrice(opt.price);
  }, [selected, rideOptions]);

  const handleRideBooking = async () => {
    if (
      !location?.latitude ||
      !location?.longitude ||
      !destination?.latitude ||
      !destination?.longitude ||
      !price ||
      !selected
    ) {
      setErrorModalMessage('Please select pickup, dropoff, and vehicle type.');
      setErrorModalVisible(true);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        startPosition: {
          lat: String(location.latitude),
          long: String(location.longitude),
          adrs: location.address || '',
        },
        destinationPosition: {
          lat: String(destination.latitude),
          long: String(destination.longitude),
          adrs: destination.address || '',
        },
        fair: price,
        vehicleType: selected,
      };
      const response = await createRide(payload);
      console.log('create response:', response.data);
      if (response.data) {
        navigation.navigate('Rider', {
          screen: 'FindRider',
          params: {
            ride: response.data,
            isAutoAccept,
          },
        });
      }
    } catch (error) {
      setErrorModalMessage('Failed to book ride. Please try again.');
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <RideLayout title="Find Offers" snapPoints={['50%', '80%', '90%']}>
        <FlatList
          data={rideOptions}
          keyExtractor={item => item.type}
          contentContainerStyle={{ padding: 16, paddingBottom: 150 }}
          renderItem={({ item }) => (
            <RideCard
              item={item}
              selected={selected}
              onSelect={setSelected}
              price={price}
              setPrice={setPrice}
            />
          )}
        />
      </RideLayout>

      {/* BOTTOM BAR */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderTopWidth: 1,
          borderTopColor: COLORS.GENERAL[100],
          padding: 16,
          backgroundColor: COLORS.BRAND_WHITE,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: COLORS.GENERAL[500],
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ZapIcon />

            <Text style={{ marginLeft: 12, color: COLORS.TEXT.DEFAULT }}>
              Auto-accept offer of{' '}
              <Text style={{ fontWeight: 'bold' }}>₹{price.toFixed(2)}</Text>
            </Text>
          </View>

          <ToggleSwitch
            isActive={isAutoAccept}
            onToggle={() => setIsAutoAccept(v => !v)}
          />
        </View>
        <CustomButton
          title="Find offers"
          onPress={handleRideBooking}
          loading={loading}
          disabled={loading}
        />
      </View>
      <ErrorModal
        isVisible={errorModalVisible}
        message={errorModalMessage}
        onClose={() => setErrorModalVisible(false)}
      />
    </View>
  );
}
