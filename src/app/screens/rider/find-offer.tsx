// --- IMPORTS ---
import { createRide } from '@/services/rideService';
import { icons } from '@/constants';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLocationStore } from '@/store';
import { calculateFare, fetchDistance } from '@/utils/mapUtils';
import RideLayout from '@/components/ride-layout';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { ZapIcon } from 'lucide-react-native';
import CustomButton from '@/components/shared/custom-button';

const PRIMARY_COLOR = '#f0bd1a';
const CARD_BG = '#f0bd1a';

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
      style={{ backgroundColor: isSelected ? CARD_BG : 'white', padding: 18 }}
    >
      <View className="flex-row items-center">
        <IconWrapper>{item.icon}</IconWrapper>

        <View className="flex-1 ml-3">
          <Text className="text-xl font-semibold text-black">{item.title}</Text>
          <Text className="text-gray-600">{item.time} away</Text>
          <Text className="text-gray-600">{item.dropTime}</Text>
        </View>

        {!isSelected && (
          <Text className="text-lg font-bold text-gray-800">
            ₹{formatPrice(item.price)}
          </Text>
        )}
      </View>

      {isSelected && (
        <View className="items-center">
          <View className="flex-row items-center bg-[#333] rounded-full px-4 py-2 mt-3">
            <TouchableOpacity
              onPress={() => setPrice(p => Math.max(20, p - 5))}
              className="w-10 h-10 rounded-full bg-[#555] flex items-center justify-center"
            >
              <Text className="text-white text-2xl font-bold">-</Text>
            </TouchableOpacity>

            <Text className="mx-6 text-white text-3xl font-bold">
              ₹{formatPrice(price)}
            </Text>

            <TouchableOpacity
              onPress={() => setPrice(p => p + 5)}
              className="w-10 h-10 rounded-full bg-[#555] flex items-center justify-center"
            >
              <Text className="text-white text-2xl font-bold">+</Text>
            </TouchableOpacity>
          </View>

          <Text className="mt-2 line-through">
            Recommended fare: ₹{formatPrice(item.price)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
const ToggleSwitch = ({ isActive, onToggle }) => {
  const trackColor = isActive ? PRIMARY_COLOR : '#d1d1d1';
  const thumbColor = isActive ? '#333' : '#888';

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
  const [selected, setSelected] = useState('Bike');
  const [loading, setLoading] = useState(false);

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

  const navigation = useNavigation();
  const route = useRoute<any>();

  const {
    distance,
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
    userAddress,
    destinationAddress,
    setDestinationLocation,
  } = useLocationStore();

  // READABLE DATE FORMAT
  const getDropTime = (duration: string) => {
    if (!duration) return '';
    const now = new Date();
    const minutes = parseInt(duration, 10) || 0;
    now.setMinutes(now.getMinutes() + minutes);
    return `Drop ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Handle selecting location
  useEffect(() => {
    if (route.params?.location) {
      setDestinationLocation(route.params.location);
    }
  }, [route.params?.location]);

  // Fetch durations + distance from Google
  useEffect(() => {
    const load = async () => {
      const bike = await fetchDistance('bicycling');
      const driving = await fetchDistance('driving');

      setDurations({
        bike: bike?.duration || '',
        auto: driving?.duration || '',
        cabEconomy: driving?.duration || '',
        cabPremium: driving?.duration || '',
      });

      if (driving?.distance) {
        const km = parseFloat(driving.distance.replace(' km', ''));
        useLocationStore.getState().setDistance(km);
      }
    };

    if (destinationLatitude && destinationLongitude) load();
  }, [destinationLatitude, destinationLongitude]);

  // ---- CALCULATE FARE (PASS DURATION TOO) ----
  useEffect(() => {
    if (!distance || !durations.auto) return;

    const durationNumber = parseInt(durations.auto, 10) || 0;

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
        type: 'Bike',
        title: 'Moto',
        icon: <BikeIcon />,
        time: durations.bike,
        dropTime: getDropTime(durations.bike),
        price: farePrices.bike,
      },
      {
        type: 'Auto',
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
    setLoading(true);

    await createRide({
      vehicle:
        selected === 'Cab Economy'
          ? 'cabEconomy'
          : selected === 'Cab Premium'
            ? 'cabPremium'
            : selected === 'Bike'
              ? 'bike'
              : 'auto',

      drop: {
        latitude: destinationLatitude,
        longitude: destinationLongitude,
        address: destinationAddress,
      },
      pickup: {
        latitude: userLatitude,
        longitude: userLongitude,
        address: userAddress,
      },
    });

    setLoading(false);
    navigation.navigate('FindRider');
  };

  return (
    <RideLayout title="Find Offers" snapPoints={['60%', '80%', '90%']}>
      <FlatList
        data={rideOptions}
        keyExtractor={item => item.type}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
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

      {/* BOTTOM BAR */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          padding: 16,
          backgroundColor: 'white',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f3f4f6',
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ZapIcon />

            <Text style={{ marginLeft: 12, color: '#1f2937' }}>
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
    </RideLayout>
  );
}
