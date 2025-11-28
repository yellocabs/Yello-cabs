// FindRider.jsx
import { icons } from "@/constants";
import { useLocationStore } from "@/store";
import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  StyleSheet,
  Image,
  Modal,
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const SPINNER_SIZE = Math.min(width, height) * 0.78;

export default function FindRider() {
  const navigation = useNavigation();
  const { userLatitude, userLongitude } = useLocationStore();

  const rippleAnim = useRef(new Animated.Value(0)).current;

  // Progress bar animation (0 → width)
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Slide-to-cancel animation (0 → width - thumbSize)
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [timeoutModal, setTimeoutModal] = useState(false);

  if (!userLatitude || !userLongitude) return <Text>Loading map...</Text>;

  // ------------------------------
  // Ripple animation
  // ------------------------------
  useEffect(() => {
    Animated.loop(
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Derived ripple animations
  const ripple1Scale = rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });
  const ripple1Opacity = rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0.0] });

  const ripple2Scale = rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.3] });
  const ripple2Opacity = rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0.0] });

  // ------------------------------
  // Start 2-minute search timer
  // ------------------------------
  const startSearchTimer = () => {
    progressAnim.setValue(0); // reset
    Animated.timing(progressAnim, {
      toValue: width,
      duration: 120000, // 2 minutes
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        // After 2 min, show modal
        setTimeoutModal(true);
      }
    });
  };

  useEffect(() => {
    startSearchTimer();
  }, []);

  // ------------------------------
  // Slide to cancel logic
  // ------------------------------
  const thumbSize = 48;
  const slideMax = width * 0.86 - thumbSize - 20;

  const handleSlide = ({ nativeEvent }) => {
    const touchX = nativeEvent.locationX;
    if (touchX < 0) return;
    if (touchX > slideMax) {
      // fully slid right → cancel & navigate
      slideAnim.setValue(slideMax);
      navigation.navigate("FindOffers");
      return;
    }
    slideAnim.setValue(touchX);
  };

  const sliderColor = slideAnim.interpolate({
    inputRange: [0, slideMax],
    outputRange: ["#000", "#FF0000"],
  });

  // ------------------------------
  // Progress bar color change at end
  // ------------------------------
  const progressBarColor = progressAnim.interpolate({
    inputRange: [0, width - 40, width],
    outputRange: ["#d3d3d3", "#FFA500", "red"],
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* BACKGROUND MAP LIKE TAXI APPS */}
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: userLatitude,
          longitude: userLongitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* USER MARKER */}
        <Marker coordinate={{ latitude: userLatitude, longitude: userLongitude }}>
          <View style={styles.userPin} />
        </Marker>

        <Circle
          center={{ latitude: userLatitude, longitude: userLongitude }}
          radius={200}
          fillColor="rgba(255, 165, 0, 0.15)"
          strokeColor="rgba(255, 165, 0, 0.6)"
        />

        {/* COMMENT: Add your REAL driver markers here */}
      </MapView>

      {/* FOREGROUND CONTENT */}
      <View className="flex-1 items-center px-5">

        {/* Header */}
        <View className="w-full flex-row items-center mt-[10%] z-10">
          <TouchableOpacity className="p-2" onPress={()=>{navigation.navigate("FindOffer")}}>
            <Image source={icons.backArrow} className="w-10 h-10" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold ml-2">Searching for Driver</Text>
        </View>

        {/* Taxi Icon */}
        <View className="mt-6 mb-3 items-center z-10">
          <View className="w-20 h-20 rounded-full bg-yellow-400 items-center justify-center shadow">
            <Image source={icons.taxi} className="w-10 h-10" />
          </View>
        </View>

        {/* Text */}
        <Text className="text-xl font-bold">Searching Ride...</Text>
        <Text className="text-sm text-gray-9000 mb-6">
          This may take a few seconds...
        </Text>

        {/* Ripple Area */}
        <View className="flex-1 justify-center items-center w-full">
          <View
            style={{
              width: SPINNER_SIZE,
              height: SPINNER_SIZE,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Ripple 1 */}
            <Animated.View
              style={[
                styles.ripple,
                {
                  width: SPINNER_SIZE * 0.9,
                  height: SPINNER_SIZE * 0.9,
                  borderRadius: SPINNER_SIZE * 0.45,
                  transform: [{ scale: ripple1Scale }],
                  opacity: ripple1Opacity,
                },
              ]}
            />

            {/* Ripple 2 */}
            <Animated.View
              style={[
                styles.ripple,
                {
                  width: SPINNER_SIZE * 0.64,
                  height: SPINNER_SIZE * 0.64,
                  borderRadius: SPINNER_SIZE * 0.32,
                  transform: [{ scale: ripple2Scale }],
                  opacity: ripple2Opacity,
                },
              ]}
            />

            {/* USER STATIC DOT */}
            <View style={styles.userDot} />
          </View>
        </View>

        {/* PROGRESS BAR FULL WIDTH */}
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim,
                backgroundColor: progressBarColor,
              },
            ]}
          />
        </View>

        {/* SLIDE TO CANCEL */}
        <View className="w-full items-center pb-6 z-10">
          <View
            style={{
              width: width * 0.86,
              height: 56,
              backgroundColor: "#eee",
              borderRadius: 30,
              paddingHorizontal: 10,
              justifyContent: "center",
            }}
            onTouchMove={handleSlide}
            onTouchStart={handleSlide}
          >
            <Animated.View
              style={[
                styles.sliderThumb,
                {
                  transform: [{ translateX: slideAnim }],
                  backgroundColor: sliderColor,
                },
              ]}
            >
              <Text style={styles.sliderText}>×</Text>
            </Animated.View>
          </View>
        </View>
      </View>

      {/* TIMEOUT POPUP */}
      <Modal transparent visible={timeoutModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>No Drivers Found</Text>
            <Text style={styles.modalMessage}>
              Sorry, we could not find any rider. All our captains are busy.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.waitBtn}
                onPress={() => {
                  setTimeoutModal(false);
                  startSearchTimer();
                }}
              >
                <Text style={styles.waitText}>Wait</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => navigation.navigate("FindOffer")}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  userPin: {
    width: 20,
    height: 20,
    backgroundColor: "#FFA500",
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#fff",
  },

  userDot: {
    width: 18,
    height: 18,
    backgroundColor: "#FFA500",
    borderRadius: 9,
    borderWidth: 3,
    borderColor: "#fff",
    zIndex: 5,
  },

  ripple: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#FFD580",
  },

  progressContainer: {
    width: width - 40,
    height: 10,
    backgroundColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressBar: {
    height: "100%",
    borderRadius: 10,
  },

  sliderThumb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  sliderText: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modalMessage: { textAlign: "center", marginBottom: 20 },

  modalButtons: { flexDirection: "row", gap: 12 },
  waitBtn: { backgroundColor: "#FFA500", padding: 12, borderRadius: 8 },
  cancelBtn: { backgroundColor: "red", padding: 12, borderRadius: 8 },

  waitText: { color: "white", fontWeight: "600" },
  cancelText: { color: "white", fontWeight: "600" },
});
