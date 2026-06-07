import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppData, Location, Machine, RecordEntry, Settings, Expense } from './types';

const STORAGE_KEY = 'slot_track_pro_data';

const DEFAULT_DATA: AppData = {
  locations: [],
  machines: [],
  records: [],
  expenses: [],
  settings: {
    theme: 'light'
  }
};

interface StoreContextType {
  data: AppData;
  addRecord: (record: RecordEntry) => void;
  updateRecord: (id: string, record: Partial<RecordEntry>) => void;
  deleteRecord: (id: string) => void;
  clearRecords: () => void;
  addLocation: (location: Location) => void;
  updateLocation: (id: string, name: string) => void;
  deleteLocation: (id: string) => void;
  addMachine: (machine: Machine) => void;
  updateMachine: (id: string, name: string, locationId: string, lastMaintenanceDate?: string) => void;
  deleteMachine: (id: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  importData: (importedData: AppData) => void;
  addExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_DATA,
          ...parsed,
          expenses: parsed.expenses || []
        };
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
    return DEFAULT_DATA;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addRecord = (record: RecordEntry) => {
    setData(prev => ({ ...prev, records: [record, ...prev.records] }));
  };

  const updateRecord = (id: string, updatedFields: Partial<RecordEntry>) => {
    setData(prev => ({
      ...prev,
      records: prev.records.map(r => r.id === id ? { ...r, ...updatedFields } : r)
    }));
  };

  const deleteRecord = (id: string) => {
    setData(prev => ({ ...prev, records: prev.records.filter(r => r.id !== id) }));
  };

  const clearRecords = () => {
    setData(prev => ({ ...prev, records: [], expenses: [] }));
  };

  const addLocation = (location: Location) => {
    setData(prev => ({ ...prev, locations: [...prev.locations, location] }));
  };

  const updateLocation = (id: string, name: string) => {
    setData(prev => ({
      ...prev,
      locations: prev.locations.map(l => l.id === id ? { ...l, name } : l),
    }));
  };

  const deleteLocation = (id: string) => {
    setData(prev => ({
      ...prev,
      locations: prev.locations.filter(l => l.id !== id),
      machines: prev.machines.filter(m => m.locationId !== id)
    }));
  };

  const addMachine = (machine: Machine) => {
    setData(prev => ({ ...prev, machines: [...prev.machines, machine] }));
  };

  const updateMachine = (id: string, name: string, locationId: string, lastMaintenanceDate?: string) => {
    setData(prev => ({
      ...prev,
      machines: prev.machines.map(m => m.id === id ? { ...m, name, locationId, lastMaintenanceDate } : m)
    }));
  };

  const deleteMachine = (id: string) => {
    setData(prev => ({ ...prev, machines: prev.machines.filter(m => m.id !== id) }));
  };

  const updateSettings = (settings: Partial<Settings>) => {
    setData(prev => ({ ...prev, settings: { ...prev.settings, ...settings } }));
  };

  const importData = (importedData: AppData) => {
    setData({
      ...DEFAULT_DATA,
      ...importedData,
      expenses: importedData.expenses || []
    });
  };

  const addExpense = (expense: Expense) => {
    setData(prev => ({
      ...prev,
      expenses: [expense, ...(prev.expenses || [])]
    }));
  };

  const deleteExpense = (id: string) => {
    setData(prev => ({
      ...prev,
      expenses: (prev.expenses || []).filter(e => e.id !== id)
    }));
  };

  return (
    <StoreContext.Provider value={{
      data,
      addRecord,
      updateRecord,
      deleteRecord,
      clearRecords,
      addLocation,
      updateLocation,
      deleteLocation,
      addMachine,
      updateMachine,
      deleteMachine,
      updateSettings,
      importData,
      addExpense,
      deleteExpense
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
