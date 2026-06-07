import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppData, Location, Machine, RecordEntry, Settings } from './types';

const STORAGE_KEY = 'slot_track_pro_data';

const DEFAULT_DATA: AppData = {
  locations: [],
  machines: [],
  records: [],
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
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
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
    setData(prev => ({ ...prev, records: [] }));
  };

  const addLocation = (location: Location) => {
    setData(prev => ({ ...prev, locations: [...prev.locations, location] }));
  };

  const updateLocation = (id: string, name: string) => {
    setData(prev => ({
      ...prev,
      locations: prev.locations.map(l => l.id === id ? { ...l, name } : l),
      // Update denormalized names in historical records? Usually history relies on snapshot at the time, 
      // but here the user might want current names in views. Let's keep strict snapshot for integrity.
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
    setData(importedData);
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
      importData
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
