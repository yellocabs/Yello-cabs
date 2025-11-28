import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "@/components/custom-button";
import { icons } from "@/constants";
import { useUserStore } from "@/store";

const IllustrationImage = require("@/assets/images/Users.gif");

const RoleScreen = () => {
  const navigation = useNavigation<any>();
  const { setRole } = useUserStore();
  const { width, height } = useWindowDimensions();

  const [selectedRole, setSelectedRole] = useState<"rider" | "captain" | null>(
    null
  );

  const handleRoleSelect = (role: "rider" | "captain") => {
    setSelectedRole(role);
    setRole(role);
  };

  const handleGetStarted = () => {
    if (selectedRole) {
      navigation.navigate("Login" as never);
    } else {
      Alert.alert("Error", "Please select a role to get started.");
    }
  };

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
      "rounded-3xl shadow-md items-center justify-between bg-brand-white";

    const selectedClasses = "border-2 border-primary-500 bg-primary-100";
    const unselectedClasses = "border border-general-300";

    const textColor = isSelected ? "text-brand-black" : "text-general-200";

    return (
      <TouchableOpacity
        style={{
          width: width * 0.40,
          paddingVertical: height * 0.02,
          paddingHorizontal: width * 0.04,
        }}
        className={`${baseClasses} ${
          isSelected ? selectedClasses : unselectedClasses
        }`}
        onPress={() => onSelect(role)}
        activeOpacity={0.9}
      >
        <View
          style={{
            width: width * 0.12,
            height: width * 0.12,
            marginBottom: height * 0.015,
          }}
          className="rounded-2xl bg-primary-100 items-center justify-center"
        >
          <Image
            source={icon}
            style={{ width: width * 0.07, height: width * 0.07 }}
            resizeMode="contain"
          />
        </View>

        <Text
          className={`text-xl font-UrbanistSemiBold mb-1 ${textColor}`}
          style={{ fontSize: width * 0.05 }}
        >
          {roleName}
        </Text>

        <Text
          className={`text-xs text-center font-UrbanistMedium ${textColor}`}
          style={{ fontSize: width * 0.032 }}
        >
          {description}
        </Text>

        {isSelected && (
          <View
            style={{
              marginTop: height * 0.015,
              paddingVertical: height * 0.006,
              paddingHorizontal: width * 0.03,
            }}
            className="rounded-full bg-brand-white self-center"
          >
            <Text
              className="text-primary-500 font-UrbanistSemiBold"
              style={{ fontSize: width * 0.03 }}
            >
              Selected
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-primary-100">
      {/* Top Circle */}
      <View
        style={{
          width: width * 0.33,
          height: width * 0.33,
          top: -height * 0.08,
          right: -width * 0.1,
        }}
        className="absolute rounded-full bg-primary-200 opacity-80"
      />

      {/* Bottom Circle */}
      <View
        style={{
          width: width * 0.37,
          height: width * 0.37,
          bottom: -height * 0.1,
          left: -width * 0.12,
        }}
        className="absolute rounded-full bg-brand-accent opacity-80"
      />

      <View
        style={{
          paddingHorizontal: width * 0.06,
          paddingTop: height * 0.07,
          paddingBottom: height * 0.05,
        }}
        className="flex-1"
      >
        {/* Illustration */}
        <View style={{ marginBottom: height * 0.03 }} className="items-center">
          <Image
            source={IllustrationImage}
            resizeMode="contain"
            style={{
              width: width * 0.95,
              height: height * 0.15,
              marginBottom: height * 0.015,
            }}
          />
        </View>

        {/* Title */}
        <View style={{ marginBottom: height * 0.04 }}>
          <Text
            className="text-center text-brand-black font-UrbanistExtraBold"
            style={{
              fontSize: width * 0.095,
              lineHeight: width * 0.11,
            }}
          >
            Choose your role
          </Text>

          <Text
            className="text-center text-general-200 font-UrbanistMedium"
            style={{
              fontSize: width * 0.042,
              marginTop: height * 0.01,
              paddingHorizontal: width * 0.03,
            }}
          >
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

        {/* Role Card */}
        <View
          className="bg-brand-white rounded-3xl shadow-lg shadow-general-300"
          style={{
            paddingHorizontal: width * 0.05,
            paddingVertical: height * 0.03,
            marginBottom: height * 0.04,
          }}
        >
          <Text
            className="font-UrbanistSemiBold text-brand-black"
            style={{ fontSize: width * 0.04, marginBottom: height * 0.02 }}
          >
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

        {/* Get Started */}
        <CustomButton
          title="Get started"
          onPress={handleGetStarted}
          bgVariant="primary"
          textVariant="default"
          rounded="2xl"
          height="h-14"
          className={`shadow-lg mt-2 ${!selectedRole ? "opacity-50" : ""}`}
          disabled={!selectedRole}
          flex={false}
        />

        {/* Made in Bharat */}
        <View
          style={{
            bottom: height * 0.03,
          }}
          className="absolute left-0 right-0 flex-row justify-center items-center"
        >
          <View
            style={{
              paddingVertical: height * 0.006,
              paddingHorizontal: width * 0.04,
            }}
            className="flex-row items-center bg-brand-white rounded-full shadow-sm"
          >
            <Image
              source={require("@/assets/icons/flag.png")}
              style={{ width: width * 0.05, height: width * 0.05 }}
              resizeMode="contain"
            />
            <Text
              className="text-general-200 font-UrbanistMedium"
              style={{
                fontSize: width * 0.03,
                marginLeft: width * 0.02,
              }}
            >
              Made in Bharat
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default RoleScreen;
