import React, { useEffect, useRef, useState } from "react";
import MapViewDirections from "react-native-maps-directions";
import { Animated } from "react-native";
import SmoothPolyline from "./SmoothPolyline";
import { DIRECTIONS_API_KEY } from "./constants";

interface Props {
  userLatitude: number;
  userLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
}

const RouteAnimator: React.FC<Props> = ({
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}) => {
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const progress = useRef(new Animated.Value(0)).current;

  // Animate route whenever routeCoords updates
  useEffect(() => {
    if (routeCoords.length < 2) return;

    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 4000,
      useNativeDriver: false,
    }).start();
  }, [routeCoords]);

  return (
    <>
    {userLatitude &&
 destinationLatitude &&
      <MapViewDirections
        origin={{ latitude: userLatitude, longitude: userLongitude }}
        destination={{ latitude: destinationLatitude, longitude: destinationLongitude }}
        apikey={DIRECTIONS_API_KEY}
        strokeWidth={0} // hide original polyline
        onReady={(result) => {
          if (result?.coordinates?.length > 1) {
            // small delay ensures MapView is fully ready
            setTimeout(() => setRouteCoords(result.coordinates), 50);
          }
        }}
        onError={(err) => console.error("Directions error:", err)}
      />}

      <SmoothPolyline coordinates={routeCoords} progress={progress} />
    </>
  );
};

export default RouteAnimator;
