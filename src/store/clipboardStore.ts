import { create } from 'zustand';

interface ClipboardState {
  lastCopiedBoletoId: number | null;
  timestamp: number | null;
  setLastCopiedBoleto: (id: number) => void;
  clearLastCopiedBoleto: () => void;
}

export const useClipboardStore = create<ClipboardState>((set) => ({
  lastCopiedBoletoId: null,
  timestamp: null,
  setLastCopiedBoleto: (id: number) => set({ lastCopiedBoletoId: id, timestamp: Date.now() }),
  clearLastCopiedBoleto: () => set({ lastCopiedBoletoId: null, timestamp: null }),
}));
