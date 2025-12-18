import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ReactNativeModal from 'react-native-modal';
import { useModalStore } from '@/store/modal-store';
import CustomButton from './custom-button';
import { COLORS } from '@/assets/colors';

const CancelRideModal = () => {
  const { isCancelRideModalVisible, hideCancelRideModal, onConfirm } = useModalStore();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    hideCancelRideModal();
  };

  return (
    <ReactNativeModal
      isVisible={isCancelRideModalVisible}
      onBackdropPress={hideCancelRideModal}
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropOpacity={0.6}
      style={styles.modal}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Cancel ride request?</Text>
        <Text style={styles.subtitle}>
          Are you sure you want to cancel this ride? The search will be stopped.
        </Text>
        <View style={styles.buttonContainer}>
          <CustomButton
            title="No, Continue Ride"
            onPress={hideCancelRideModal}
            className="flex-1 bg-gray-200"
            textClassName="text-black"
          />
          <CustomButton
            title="Yes, Cancel Ride"
            onPress={handleConfirm}
            className="flex-1 bg-danger-500"
          />
        </View>
      </View>
    </ReactNativeModal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  container: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.TEXT.MUTED,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
});

export default CancelRideModal;
