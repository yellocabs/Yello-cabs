import { createRide } from '@/services/rideService';
import CustomButton from '@/components/custom-button';
import { icons } from '@/constants';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLocationStore } from '@/store';
import { calculateFare, fetchDistance } from '@/utils/mapUtils';
import RideLayout from '@/components/ride-layout';
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const PRIMARY_COLOR = '#f0bd1a';
const CARD_BG = '#f0bd1a';

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

const SnowflakeIcon = () => <Text className="text-3xl">❄️</Text>;
const ZapIcon = () => <Text className="text-xl text-gray-700">⚡</Text>;

const IconWrapper = ({ children }) => (
  <View className="w-10 h-10 flex items-center justify-center">{children}</View>
);

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

const PriceAdjuster = ({ price, setPrice }) => {
  const dec = () => setPrice(p => Math.max(20, p - 5));
  const inc = () => setPrice(p => p + 5);

  return (
    <View className="flex-row items-center bg-[#333] rounded-full px-4 py-2 mt-3">
      <TouchableOpacity
        onPress={dec}
        className="w-10 h-10 rounded-full bg-[#555] flex items-center justify-center"
      >
        <Text className="text-white text-2xl font-bold">-</Text>
      </TouchableOpacity>

      <Text className="mx-6 text-white text-3xl font-bold">₹{price}</Text>

      <TouchableOpacity
        onPress={inc}
        className="w-10 h-10 rounded-full bg-[#555] flex items-center justify-center"
      >
        <Text className="text-white text-2xl font-bold">+</Text>
      </TouchableOpacity>
    </View>
  );
};

// RIDE CARD
const RideCard = ({ item, selected, onSelect, price, setPrice }) => {
  const isSelected = selected === item.type;

  return (
    <TouchableOpacity
      onPress={() => onSelect(item.type)}
      className="rounded-2xl mb-5"
      style={{
        backgroundColor: isSelected ? CARD_BG : 'white',
        padding: 18,
      }}
    >
      {/* HEADER */}
      <View className="flex-row items-center">
        <IconWrapper>{item.icon}</IconWrapper>

        <View className="flex-1 ml-3">
          <Text className={`text-xl font-semibold ${'text-black'}`}>
            {item.title}
          </Text>
          <Text className={'text-gray-600'}>{item.time}</Text>
          <Text className={'text-gray-600'}>{item.description}</Text>
        </View>

        {!isSelected && (
          <Text className="text-lg font-bold text-gray-800">
            ₹{item.price.toFixed(2)}
          </Text>
        )}
      </View>

      {/* PRICE ADJUSTER ONLY WHEN SELECTED */}
      {isSelected && (
        <View className="items-center">
          <PriceAdjuster price={price} setPrice={setPrice} />
          <Text className=" mt-2 line-through">
            Recommended fare: ₹{item.price.toFixed(2)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// MAIN SCREEN
export default function FindOffers() {
  const [isAutoAccept, setIsAutoAccept] = useState(true);
  const [price, setPrice] = useState(0);
  const [selected, setSelected] = useState('Bike');
  const [loading, setLoading] = useState(false);
  const [durations, setDurations] = useState({
    bike: '',
    auto: '',
    cabEconomy: '',
    cabPremium: '',
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
  } = useLocationStore();

  const farePrices = useMemo(() => calculateFare(distance || 0), [distance]);

  useEffect(() => {
    const getDurations = async () => {
      const bikeDuration = await fetchDistance('bicycling');
      const drivingDuration = await fetchDistance('driving');
      setDurations({
        bike: bikeDuration?.duration || '',
        auto: drivingDuration?.duration || '',
        cabEconomy: drivingDuration?.duration || '',
        cabPremium: drivingDuration?.duration || '',
      });
    };
    getDurations();
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude]);

  const rideOptions = useMemo(
    () => [
      {
        type: 'Bike',
        seats: 1,
        time: durations.bike,
        dropTime: '4:28 pm',
        price: farePrices?.bike,
        isFastest: true,
        icon: <BikeIcon />,
        title: 'Moto',
      },
      {
        type: 'Auto',
        seats: 3,
        time: durations.auto,
        dropTime: '4:30 pm',
        price: farePrices.auto,
        icon: <AutoIcon />,
        title: 'Auto',
      },
      {
        type: 'Cab Economy',
        seats: 4,
        time: durations.cabEconomy,
        dropTime: '4:28 pm',
        price: farePrices.cabEconomy,
        icon: <CabIcon />,
        title: 'Cab Economy',
      },
      {
        type: 'Cab Premium',
        seats: 4,
        time: durations.cabPremium,
        dropTime: '4:30 pm',
        price: farePrices.cabPremium,
        icon: <CabPremiumIcon />,
        title: 'Cab Premium',
      },
    ],
    [farePrices, durations],
  );

  useEffect(() => {
    const selectedOption = rideOptions.find(option => option.type === selected);
    if (selectedOption) {
      setPrice(selectedOption.price);
    }
  }, [selected, rideOptions]);

  const handleOptionSelect = useCallback((type: string) => {
    setSelected(type);
  }, []);

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
    <RideLayout title="Find Offers" h={0.6} minHeight={0.6}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, backgroundColor: 'white', paddingBottom: 100 }}>
          {/* Scrollable List */}

          <FlatList
            data={rideOptions}
            keyExtractor={item => item.type}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <RideCard
                item={item}
                selected={selected}
                onSelect={handleOptionSelect}
                price={price}
                setPrice={setPrice}
              />
            )}
          />
        </View>
      </ScrollView>

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
