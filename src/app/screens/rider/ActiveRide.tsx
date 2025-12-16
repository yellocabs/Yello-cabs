import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { COLORS } from '@/assets/colors';

const ActiveRideScreen = () => {
  const route = useRoute<any>();
  const { rideId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Ride</Text>
      <Text style={styles.text}>You are on ride: {rideId}</Text>
      {/* TODO: Implement the full active ride UI with map, route, and ride details */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BG.DEFAULT,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
  },
});

export default ActiveRideScreen;
