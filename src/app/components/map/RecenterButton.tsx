import React from "react";
import { TouchableOpacity, Image } from "react-native";
import { icons } from "@/constants";
import { bottomOffset } from "./constants";

interface Props {
  onPress: () => void;
}

const RecenterButton: React.FC<Props> = ({ onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        position: "absolute",
        bottom: bottomOffset,
        right: 16,
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 40,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 6,
      }}
    >
      <Image
        source={icons.crosshair}
        style={{ width: 26, height: 26, tintColor: "#000" }}
      />
    </TouchableOpacity>
  );
};

export default RecenterButton;
