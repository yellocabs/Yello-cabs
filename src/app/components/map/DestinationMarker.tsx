import React from "react";
import { Image, Text } from "react-native";
import { Marker } from "react-native-maps";
import { icons } from "@/constants";
import { useLocationStore } from "@/store";

interface Props {
  latitude: number | null;
  longitude: number | null;
}

const DestinationMarker: React.FC<Props> = ({ latitude, longitude }) => {
  if (!latitude || !longitude) return null;
    const {destinationAddress} = useLocationStore();
  return (
    <Marker
      coordinate={{ latitude, longitude }}
      style={{ width: 40, height: 40 }}
    >
      <Image
        source={icons.pin}
        style={{ width: 30, height: 30, tintColor: "#E91E63" }}
        resizeMode="contain"
      />
      <Text style={{ fontSize: 12, fontWeight: "bold" }}>
      {destinationAddress}
    </Text>
    </Marker>
  );
};

export default DestinationMarker;
