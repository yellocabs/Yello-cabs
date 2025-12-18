import { create } from 'zustand';

interface ModalState {
  isCancelRideModalVisible: boolean;
  onConfirm: (() => void) | null;
  isNoDriverFoundModalVisible: boolean;
  onKeepSearching: (() => void) | null;
  onCancel: (() => void) | null;
  showCancelRideModal: (onConfirm: () => void) => void;
  hideCancelRideModal: () => void;
  showNoDriverFoundModal: (
    onKeepSearching: () => void,
    onCancel: () => void,
  ) => void;
  hideNoDriverFoundModal: () => void;
}

export const useModalStore = create<ModalState>(set => ({
  isCancelRideModalVisible: false,
  onConfirm: null,
  isNoDriverFoundModalVisible: false,
  onKeepSearching: null,
  onCancel: null,
  showCancelRideModal: onConfirmCallback =>
    set({ isCancelRideModalVisible: true, onConfirm: onConfirmCallback }),
  hideCancelRideModal: () =>
    set({ isCancelRideModalVisible: false, onConfirm: null }),
  showNoDriverFoundModal: (onKeepSearchingCallback, onCancelCallback) =>
    set({
      isNoDriverFoundModalVisible: true,
      onKeepSearching: onKeepSearchingCallback,
      onCancel: onCancelCallback,
    }),
  hideNoDriverFoundModal: () =>
    set({
      isNoDriverFoundModalVisible: false,
      onKeepSearching: null,
      onCancel: null,
    }),
}));
