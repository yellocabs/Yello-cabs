import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";

import RideLayout from "@/components/ride-layout";
import { useNavigation } from "@react-navigation/native";

const PRIMARY_COLOR = "#f0bd1a";
const CARD_BG = "#f0bd1a";

const BikeIcon = () => <Text className="text-3xl">🏍️</Text>;
const SnowflakeIcon = () => <Text className="text-3xl">❄️</Text>;
const CarIcon = () => <Text className="text-3xl">🚗</Text>;
const ZapIcon = () => <Text className="text-xl text-gray-700">⚡</Text>;

const IconWrapper = ({ children }) => (
  <View className="w-10 h-10 flex items-center justify-center">
    {children}
  </View>
);

const ToggleSwitch = ({ isActive, onToggle }) => {
  const trackColor = isActive ? PRIMARY_COLOR : "#d1d1d1";
  const thumbColor = isActive ? "#333" : "#888";

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
  const dec = () => setPrice((p) => Math.max(20, p - 5));
  const inc = () => setPrice((p) => p + 5);

  return (
    <View className="flex-row items-center bg-[#333] rounded-full px-4 py-2 mt-3">
      <TouchableOpacity
        onPress={dec}
        className="w-10 h-10 rounded-full bg-[#555] flex items-center justify-center"
      >
        <Text className="text-white text-2xl font-bold">-</Text>
      </TouchableOpacity>

      <Text className="mx-6 text-white text-3xl font-bold">
        ₹{price}
      </Text>

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
const RideCard = ({
  item,
  selected,
  onSelect,
  price,
  setPrice,
}) => {
  const isSelected = selected === item.id;

  return (
    <TouchableOpacity
      onPress={() => onSelect(item.id)}
      className="rounded-2xl mb-5"
      style={{
        backgroundColor: isSelected ? CARD_BG : "white",
        padding: 18,
      }}
    >
      {/* HEADER */}
      <View className="flex-row items-center">
        <IconWrapper>{item.icon}</IconWrapper>

        <View className="flex-1 ml-3">
          <Text
            className={`text-xl font-semibold ${
              "text-black"
            }`}
          >
            {item.title}
          </Text>
          <Text className={ "text-gray-600"}>
            {item.time}
          </Text>
          <Text className={ "text-gray-600"}>
            {item.description}
          </Text>
        </View>

        {!isSelected && (
          <Text className="text-lg font-bold text-gray-800">
            ₹{item.price}
          </Text>
        )}
      </View>

      {/* PRICE ADJUSTER ONLY WHEN SELECTED */}
      {isSelected && (
        <View className="items-center">
          <PriceAdjuster price={price} setPrice={setPrice} />
          <Text className=" mt-2 line-through">
            Recommended fare: ₹{item.recommendedPrice}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// MAIN SCREEN
export default function FindOffers() {
  const [isAutoAccept, setIsAutoAccept] = useState(true);
  const [price, setPrice] = useState(110);
  const [selected, setSelected] = useState(1);
  const navigation = useNavigation();  

  const rideOptions = [
    {
      id: 1,
      title: "Moto",
      time: "1 • 3 min",
      description: "Affordable moto rides",
      recommendedPrice: 129,
      icon: <BikeIcon />,
      price: price, // not used in UI when selected
    },
    {
      id: 2,
      title: "Ride A/C",
      time: "4 • 3 min",
      description: "Cars with AC",
      price: 305,
      icon: <SnowflakeIcon />,
      recommendedPrice: 305,
    },
    {
      id: 3,
      title: "Comfort AC",
      time: "4 • 2 min",
      description: "Premium cars",
      price: 420,
      icon: <CarIcon />,
      recommendedPrice: 420,
    },
    {
      id: 4,
      title: "Moto",
      time: "1 • 3 min",
      description: "Affordable moto rides",
      recommendedPrice: 129,
      icon: <BikeIcon />,
      price: price, // not used in UI when selected
    },
    {
      id: 5,
      title: "Ride A/C",
      time: "4 • 3 min",
      description: "Cars with AC",
      price: 305,
      icon: <SnowflakeIcon />,
      recommendedPrice: 305,
    },
    {
      id: 6,
      title: "Comfort AC",
      time: "4 • 2 min",
      description: "Premium cars",
      price: 420,
      icon: <CarIcon />,
      recommendedPrice: 420,
    }, 
  ];

  return (
    <RideLayout title="Find Offers" h={0.6} minHeight={0.6}>
      <View className="flex-1 bg-white">
        {/* Scrollable List */}
        <FlatList
          data={rideOptions}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
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
        <View className="border-t border-gray-200 p-4 bg-white mb-[20%]">
          <View className="flex-row items-center justify-between bg-gray-100 p-4 rounded-xl mb-4">
            <View className="flex-row items-center">
              <ZapIcon />
              <Text className="ml-3 text-gray-800">
                Auto-accept offer of{" "}
                <Text className="font-extrabold">₹{price}</Text>
              </Text>
            </View>

            <ToggleSwitch
              isActive={isAutoAccept}
              onToggle={() => setIsAutoAccept((v) => !v)}
            />
          </View>

        <TouchableOpacity
  className="w-full py-4 rounded-xl items-center"
  style={{
    backgroundColor: PRIMARY_COLOR,
    elevation: 6,
  }}
  onPress={() => navigation.navigate("FindRider")}
>
  <Text className="text-lg font-extrabold text-[#333]">
    Find offers
  </Text>
</TouchableOpacity>

        </View>
      </View>
    </RideLayout>
  );
}
