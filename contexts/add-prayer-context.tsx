import { createContext, ReactNode, useContext, useState } from "react";

interface AddPrayerContextType {
  isAddModalVisible: boolean;
  openAddModal: () => void;
  closeAddModal: () => void;
}

const AddPrayerContext = createContext<AddPrayerContextType | undefined>(
  undefined
);

export function AddPrayerProvider({ children }: { children: ReactNode }) {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const openAddModal = () => setIsAddModalVisible(true);
  const closeAddModal = () => setIsAddModalVisible(false);

  return (
    <AddPrayerContext.Provider
      value={{ isAddModalVisible, openAddModal, closeAddModal }}
    >
      {children}
    </AddPrayerContext.Provider>
  );
}

export function useAddPrayer() {
  const context = useContext(AddPrayerContext);
  if (context === undefined) {
    throw new Error("useAddPrayer must be used within an AddPrayerProvider");
  }
  return context;
}
