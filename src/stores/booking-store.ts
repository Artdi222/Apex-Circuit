import { create } from 'zustand';

interface BookingState {
  currentStep: number;
  selectedSlotId: string | null;
  participantsCount: number;
  selectedVehicleIds: (string | null)[];
  selectedEquipment: Array<{ id: string; quantity: number }>;
  
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  
  selectSlot: (slotId: string | null) => void;
  setParticipantsCount: (count: number) => void;
  selectVehicle: (index: number, vehicleId: string | null) => void;
  toggleEquipment: (equipmentId: string, quantity: number) => void;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  currentStep: 1,
  selectedSlotId: null,
  participantsCount: 1,
  selectedVehicleIds: [null],
  selectedEquipment: [],

  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: state.currentStep - 1 })),
  setStep: (step) => set({ currentStep: step }),

  selectSlot: (slotId) => set({ selectedSlotId: slotId }),
  setParticipantsCount: (count) => set((state) => {
    const newVehicleIds = [...state.selectedVehicleIds];
    if (count > newVehicleIds.length) {
      for (let i = newVehicleIds.length; i < count; i++) {
        newVehicleIds.push(null);
      }
    } else if (count < newVehicleIds.length) {
      newVehicleIds.splice(count);
    }
    return { participantsCount: count, selectedVehicleIds: newVehicleIds };
  }),
  selectVehicle: (index, vehicleId) => set((state) => {
    const newVehicleIds = [...state.selectedVehicleIds];
    newVehicleIds[index] = vehicleId;
    return { selectedVehicleIds: newVehicleIds };
  }),
  
  toggleEquipment: (equipmentId, quantity) => set((state) => {
    const existing = state.selectedEquipment.find((e) => e.id === equipmentId);
    if (existing) {
      if (quantity === 0) {
        return { selectedEquipment: state.selectedEquipment.filter((e) => e.id !== equipmentId) };
      }
      return {
        selectedEquipment: state.selectedEquipment.map((e) => 
          e.id === equipmentId ? { ...e, quantity } : e
        )
      };
    }
    return { selectedEquipment: [...state.selectedEquipment, { id: equipmentId, quantity }] };
  }),

  resetBooking: () => set({
    currentStep: 1,
    selectedSlotId: null,
    participantsCount: 1,
    selectedVehicleIds: [null],
    selectedEquipment: [],
  }),
}));
