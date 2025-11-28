import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "@/components/custom-button";
import { icons } from "@/constants";
import { useUserStore } from "@/store";

const IllustrationImage = require("@/assets/images/Users.gif");

/**
 * @typedef {'rider' | 'captain' | null} Role
 */

const RoleScreen = () => {
  const navigation = useNavigation<any>();
  const {setRole} = useUserStore();
  const [selectedRole, setSelectedRole] = useState<"rider" | "captain" | null>(
    null
  );

  const handleRoleSelect = (role: "rider" | "captain") => {
    setSelectedRole(role);
    setRole(role)
    console.log(role)
  };

  const handleGetStarted = () => {
    if (selectedRole) {
      navigation.navigate("Login" as never);
    } else {
      Alert.alert("Error", "Please select a role to get started.");
    }
  };

  /**
   * Reusable component for the role selection button.
   */
  const RoleOption = ({
    role,
    icon,
    isSelected,
    onSelect,
  }: {
    role: "rider" | "captain";
    icon: any;
    isSelected: boolean;
    onSelect: (role: "rider" | "captain") => void;
  }) => {
    const roleName = role === "rider" ? "Rider" : "Captain";
    const description =
      role === "rider"
        ? "Book quick and safe rides."
        : "Earn by driving your cab.";

    const baseClasses =
      "w-[48%] rounded-3xl p-4 shadow-md items-center justify-between bg-brand-white";
    const selectedClasses = "border-2 border-primary-500 bg-primary-100";
    const unselectedClasses = "border border-general-300";

    const textColor = isSelected ? "text-brand-black" : "text-general-200";

    return (
      <TouchableOpacity
        className={`${baseClasses} ${
          isSelected ? selectedClasses : unselectedClasses
        }`}
        onPress={() => onSelect(role)}
        activeOpacity={0.9}
      >
        <View className="w-12 h-12 rounded-2xl bg-primary-100 items-center justify-center mb-3">
          <Image source={icon} className="w-7 h-7" resizeMode="contain" />
        </View>

        <Text
          className={`text-xl mb-1 font-UrbanistSemiBold ${textColor}`}
        >
          {roleName}
        </Text>
        <Text
          className={`text-xs text-center font-UrbanistMedium ${textColor}`}
        >
          {description}
        </Text>

        {isSelected && (
          <View className="mt-3 px-3 py-1 rounded-full bg-brand-white self-center">
            <Text className="text-[11px] font-UrbanistSemiBold text-primary-500">
              Selected
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-primary-100">
      {/* Decorative background shapes */}
      <View className="absolute -top-16 -right-10 w-40 h-40 rounded-full bg-primary-200 opacity-80" />
      <View className="absolute -bottom-20 -left-14 w-44 h-44 rounded-full bg-brand-accent opacity-80" />

      <View className="flex-1 px-6 pt-12 pb-8">
        {/* Illustration */}
        <View className="items-center justify-center mb-6">
          <Image
            source={IllustrationImage}
            className="w-full h-52 mb-4"
            resizeMode="contain"
          />
        </View>

        {/* Title & Description */}
        <View className="mb-8">
          <Text className="text-4xl text-center text-brand-black font-UrbanistExtraBold mb-2 leading-tight">
            Choose your role
          </Text>
          <Text className="text-base text-center text-general-200 font-UrbanistMedium px-3">
            Select{" "}
            <Text className="font-UrbanistSemiBold text-brand-black">
              Captain
            </Text>{" "}
            if you want to drive, or{" "}
            <Text className="font-UrbanistSemiBold text-brand-black">
              Rider
            </Text>{" "}
            if you want to travel.
          </Text>
        </View>

        {/* Role Selection Card */}
        <View className="bg-brand-white rounded-3xl px-5 py-6 shadow-lg shadow-general-300 mb-8">
          <Text className="text-sm font-UrbanistSemiBold text-brand-black mb-4">
            Continue as
          </Text>

          <View className="flex-row justify-between">
            <RoleOption
              role="rider"
              icon={icons.user}
              isSelected={selectedRole === "rider"}
              onSelect={handleRoleSelect}
            />
            <RoleOption
              role="captain"
              icon={icons.driver}
              isSelected={selectedRole === "captain"}
              onSelect={handleRoleSelect}
            />
          </View>
        </View>

        {/* Get Started Button */}
        <CustomButton
          title="Get started"
          onPress={handleGetStarted}
          bgVariant="primary"
          textVariant="default"
          rounded="2xl"
          height="h-14"
          className={`shadow-lg mt-2 ${
            !selectedRole ? "opacity-50" : ""
          }`}
          disabled={!selectedRole}
          flex={false}
        />

        {/* Made in Bharat Tag */}
        <View className="absolute bottom-8 left-0 right-0 flex-row justify-center items-center">
          <View className="flex-row items-center px-4 py-2 bg-brand-white rounded-full shadow-sm">
            <Image
              source={require("@/assets/icons/flag.png")}
              className="w-5 h-5 mr-2"
              resizeMode="contain"
            />
            <Text className="text-[12px] text-general-200 font-UrbanistMedium">
              Made in Bharat
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default RoleScreen;
