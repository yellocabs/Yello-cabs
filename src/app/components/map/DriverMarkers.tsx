import React from "react";
import { Image } from "react-native";
import { Marker } from "react-native-maps";
import { icons } from "@/constants";
import { MarkerData } from "@/types/declare";

interface Props {
  markers: MarkerData[];
  selectedDriver: number | null;
}

const DriverMarkers: React.FC<Props> = ({ markers, selectedDriver }) => {
  return (
    <>
      {markers.map((m) => (
        <Marker
          key={m.id}
          coordinate={{ latitude: m.latitude, longitude: m.longitude }}
        >
          <Image
            source={selectedDriver === +m.id ? icons.selectedMarker : icons.marker}
            style={{ width: 36, height: 36 }}
            resizeMode="contain"
          />
        </Marker>
      ))}
    </>
  );
};

export default DriverMarkers;
