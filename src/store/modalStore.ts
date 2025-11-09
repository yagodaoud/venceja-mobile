import { create } from 'zustand';

interface ModalState {
  isAnyModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isAnyModalOpen: false,
  setModalOpen: (open: boolean) => set({ isAnyModalOpen: open }),
}));

