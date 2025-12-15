import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

import Map from '@/components/map';
import { useUserStore } from '@/store';
import { useWS } from '@/services/WSProvider';
import { COLORS } from '@/assets/colors';
import { useFetchLocation } from '@/hooks/useFetchLocation';

const RiderHomeScreen = () => {
  const { location } = useUserStore();
  const { emit, disconnect } = useWS();
  useFetchLocation();

  const [isOnline, setIsOnline] = useState(false);

  const handleToggleOnline = () => {
    if (isOnline) {
      emit('goOffDuty');
      disconnect();
      setIsOnline(false);
    } else {
      if (!location) return;

      emit('goOnDuty', {
        coords: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        vehicleId: 'your-vehicle-id',
      });
      setIsOnline(true);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isOnline && location) {
      interval = setInterval(() => {
        emit('updateLocation', {
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }, 10000);
    }

    return () => interval && clearInterval(interval);
  }, [isOnline, location]);

  return (
    <View style={styles.container}>
      {/* MAP */}
      <Map latitude={location?.latitude} longitude={location?.longitude} />

      {/* ONLINE / OFFLINE STATUS */}
      <SafeAreaView style={styles.statusWrapper}>
        <View
          style={[styles.statusPill, isOnline ? styles.online : styles.offline]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isOnline ? '#22c55e' : '#f97316' },
            ]}
          />
          <Text style={styles.statusText}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </SafeAreaView>

      {/* INCOMING REQUEST PREVIEW (VISIBLE ALWAYS) */}
      <View style={styles.requestCard}>
        <Text style={styles.requestTitle}>Incoming Ride</Text>

        <View style={styles.requestRow}>
          <Text style={styles.label}>Pickup</Text>
          <Text style={styles.value}>Sector 17, Chandigarh</Text>
        </View>

        <View style={styles.requestRow}>
          <Text style={styles.label}>Drop</Text>
          <Text style={styles.value}>Mohali Phase 7</Text>
        </View>

        <View style={styles.requestFooter}>
          <Text style={styles.price}>₹180</Text>
          <Text style={styles.distance}>4.2 km</Text>
        </View>
      </View>

      {/* BOTTOM ACTION */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          onPress={handleToggleOnline}
          style={[
            styles.actionButton,
            isOnline ? styles.goOffline : styles.goOnline,
          ]}
        >
          <Text style={styles.actionText}>
            {isOnline ? 'Go Offline' : 'Go Online'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG.DEFAULT,
  },

  /* STATUS */
  statusWrapper: {
    position: 'absolute',
    top: 10,
    left: 16,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  online: {
    backgroundColor: '#ecfdf5',
  },
  offline: {
    backgroundColor: '#fff7ed',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontWeight: '600',
    color: COLORS.TEXT.DEFAULT,
  },

  /* REQUEST CARD */
  requestCard: {
    position: 'absolute',
    bottom: 110,
    left: 16,
    right: 16,
    backgroundColor: COLORS.BRAND_WHITE,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: COLORS.TEXT.DEFAULT,
  },
  requestRow: {
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    color: COLORS.TEXT.MUTED,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT.DEFAULT,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.PRIMARY.DEFAULT,
  },
  distance: {
    fontSize: 14,
    color: COLORS.TEXT.MUTED,
  },

  /* BOTTOM ACTION */
  bottomAction: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
  },
  actionButton: {
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goOnline: {
    backgroundColor: '#22c55e',
  },
  goOffline: {
    backgroundColor: '#ef4444',
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default RiderHomeScreen;
