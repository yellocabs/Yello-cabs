import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '@/assets/colors';
import { useModalStore } from '@/store/modal-store';

// === Responsive utils ===
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 375;
const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;

const NoDriverFoundModal: React.FC = () => {
  const { isNoDriverFoundModalVisible, onKeepSearching, onCancel } =
    useModalStore();
  const modalAnim = useSharedValue(0);

  React.useEffect(() => {
    modalAnim.value = withTiming(isNoDriverFoundModalVisible ? 1 : 0, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [isNoDriverFoundModalVisible, modalAnim]);

  const modalOverlayStyle = useAnimatedStyle(() => ({
    opacity: modalAnim.value,
  }));

  const modalBoxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.96 + 0.04 * modalAnim.value }],
    opacity: modalAnim.value,
    translateY: (1 - modalAnim.value) * 8,
  }));

  if (!isNoDriverFoundModalVisible) {
    return null;
  }

  return (
    <Animated.View style={[styles.modalOverlay, modalOverlayStyle]}>
      <Animated.View style={[styles.modalBox, modalBoxStyle]}>
        <Text style={styles.modalTitle}>No drivers found</Text>
        <Text style={styles.modalDesc}>
          We couldn't find a driver nearby. Would you like to keep searching or
          cancel your request?
        </Text>

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={[styles.modalBtn, styles.modalKeepBtn]}
            onPress={onKeepSearching || undefined}
          >
            <Text style={styles.modalKeepText}>Keep searching</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modalBtn, styles.modalCancelConfirmBtn]}
            onPress={onCancel || undefined}
          >
            <Text style={styles.modalCancelConfirmText}>Cancel request</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(24),
  },
  modalBox: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: COLORS.BG.MUTED,
    borderRadius: scale(14),
    padding: scale(18),
    alignItems: 'center',
    shadowColor: COLORS.BRAND_BLACK,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  modalTitle: {
    fontSize: scale(18),
    fontWeight: '800',
    color: COLORS.TEXT.DEFAULT,
    marginBottom: scale(6),
  },
  modalDesc: {
    fontSize: scale(14),
    color: COLORS.TEXT.MUTED,
    textAlign: 'center',
    marginBottom: scale(18),
    lineHeight: scale(20),
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: scale(10),
  },
  modalBtn: {
    flex: 1,
    paddingVertical: scale(12),
    borderRadius: scale(10),
    alignItems: 'center',
  },
  modalKeepBtn: {
    backgroundColor: COLORS.GENERAL[300],
  },
  modalKeepText: {
    color: COLORS.TEXT.DEFAULT,
    fontWeight: '700',
  },
  modalCancelConfirmBtn: {
    backgroundColor: COLORS.DANGER[500],
  },
  modalCancelConfirmText: {
    color: COLORS.BRAND_WHITE,
    fontWeight: '800',
  },
});

export default NoDriverFoundModal;
