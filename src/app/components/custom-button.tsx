import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ButtonProps } from "@/types/declare";

const getBgVariantStyle = (variant: ButtonProps["bgVariant"]) => {
  // If the variant starts with 'bg-' assume it's a raw Tailwind class
  if (variant?.startsWith("bg-")) return variant;

  switch (variant) {
    case "secondary":
      return "bg-gray-500";
    case "danger":
      return "bg-red-500";
    case "success":
      return "bg-green-500";
    case "outline":
      return "bg-transparent border-neutral-300 border-[0.5px]";
    case "primary":
    default:
      return "bg-primary";
  }
};


const getTextVariantStyle = (variant: ButtonProps["textVariant"]) => {
  switch (variant) {
    case "primary":
      return "text-black";
    case "secondary":
      return "text-gray-100";
    case "danger":
      return "text-red-100";
    case "success":
      return "text-green-100";
      
    case "default":
    default:
      return "text-white";
  }
};

const CustomButton = ({
  onPress,
  title,
  bgVariant = "primary",
  textVariant = "default",
  IconLeft,
  IconRight,
  className = "",
  rounded = "full",
  height = "h-14",
  flex = false,
  ...props
}: ButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${flex ? "flex-1" : "w-full"} ${height} ${
        rounded === "xl" ? "rounded-xl" : "rounded-full"
      } flex-row justify-center items-center shadow-md shadow-neutral-400/70 ${getBgVariantStyle(
        bgVariant
      )} ${className}`}
      {...props}
    >
      {IconLeft && <View className="mr-2"><IconLeft /></View>}
      <Text className={`text-lg font-bold ${getTextVariantStyle(textVariant)} text-center`}>
        {title}
      </Text>
      {IconRight && <View className="ml-2"><IconRight /></View>}
    </TouchableOpacity>
  );
};


export default CustomButton;
