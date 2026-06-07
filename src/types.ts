export interface Location {
  id: string;
  name: string;
}

export interface Machine {
  id: string;
  name: string;
  locationId: string;
  lastMaintenanceDate?: string;
}

export interface RecordEntry {
  id: string;
  timestamp: number;
  dateStr: string; // YYYY-MM-DD
  locationId: string;
  locationName: string;
  machineId?: string;
  machineName?: string;
  coinCount: number;
  coinValue: number;
  total: number;
  ownerShare: number; // 65%
  managerShare: number; // 35%
  notes: string;
}

export interface Expense {
  id: string;
  timestamp: number;
  dateStr: string; // YYYY-MM-DD
  amount: number;
  notes: string;
  category: string; // e.g., 'Repuesto', 'Mantenimiento', 'Comisión', 'Transporte', 'Otro'
  locationId?: string;
  locationName?: string;
}

export interface Settings {
  masterPassword?: string;
  theme: 'light' | 'dark';
}

export interface AppData {
  locations: Location[];
  machines: Machine[];
  records: RecordEntry[];
  expenses?: Expense[]; // Make optional for backward compatibility during parsing
  settings: Settings;
}

