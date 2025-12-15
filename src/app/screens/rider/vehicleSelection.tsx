import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '@/store';
import CustomButton from '@/components/shared/custom-button';
import { icons } from '@/constants';
import { COLORS } from '@/assets/colors';

type VehicleType = 'bike' | 'car' | 'auto';

const VehicleSelectionScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useUserStore();
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(
    null,
  );

  const handleContinue = () => {
    if (!selectedVehicle) return;

    const isProfileComplete =
      user?.firstName &&
      user?.lastName &&
      user?.profileImage &&
      user?.licenseNumber;

    if (isProfileComplete) {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Driver',
            params: {
              screen: 'Home',
              params: { vehicleType: selectedVehicle },
            },
          },
        ],
      });
    } else {
      navigation.navigate('Driver', {
        screen: 'Profile',
        params: { vehicleType: selectedVehicle, needsCompletion: true },
      });
    }
  };

  const VehicleCard = ({
    type,
    icon,
    label,
  }: {
    type: VehicleType;
    icon: any;
    label: string;
  }) => {
    const isSelected = selectedVehicle === type;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setSelectedVehicle(type)}
        style={[styles.card, isSelected && styles.cardSelected]}
      >
        <View style={[styles.iconWrapper, isSelected && styles.iconSelected]}>
          <Image source={icon} style={styles.icon} resizeMode="contain" />
        </View>

        <Text style={[styles.cardLabel, isSelected && styles.labelSelected]}>
          {label}
        </Text>

        {isSelected && <View style={styles.dot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose Vehicle</Text>
          <Text style={styles.subtitle}>
            Select the vehicle you’ll be driving
          </Text>
        </View>

        {/* Options */}
        <View style={styles.cardsContainer}>
          <VehicleCard type="bike" icon={icons.bike} label="Bike" />
          <VehicleCard type="car" icon={icons.cab} label="Car" />
          <VehicleCard type="auto" icon={icons.auto} label="Auto" />
        </View>

        {/* CTA */}
        <View style={styles.footer}>
          <CustomButton
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedVehicle}
            className={`${!selectedVehicle ? 'opacity-50' : ''}`}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.BRAND_WHITE,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },

  header: {
    marginTop: 32,
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.TEXT.DEFAULT,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT.MUTED,
  },

  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  card: {
    width: 105,
    paddingVertical: 20,
    borderRadius: 20,
    backgroundColor: COLORS.BRAND_WHITE,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.GENERAL[100],
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardSelected: {
    borderColor: COLORS.PRIMARY.DEFAULT,
    backgroundColor: COLORS.PRIMARY[100],
    transform: [{ scale: 1.05 }],
  },

  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.GENERAL[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconSelected: {
    backgroundColor: COLORS.BRAND_WHITE,
  },
  icon: {
    width: 36,
    height: 36,
  },

  cardLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.TEXT.DEFAULT,
  },
  labelSelected: {
    color: COLORS.PRIMARY.DEFAULT,
  },

  dot: {
    marginTop: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.PRIMARY.DEFAULT,
  },

  footer: {
    marginTop: 'auto',
    paddingBottom: 16,
  },
});

export default VehicleSelectionScreen;
