import { create } from 'zustand';
import { db } from '../db/db';

export interface Device {
  id: number;
  name: string;
  type: string;
  category: string;
  room_id: number;
  status: number;
  energy_rate: number;
  device_count: number;
  monthly_cost: number;
  icon: string;
  last_toggled: string | null;
  usage_hours: number;
  value: number;
  mode: string;
  secondary_value: number;
  today_cost: number;
}

export interface Room {
  id: number;
  name: string;
  icon: string;
  temperature: number;
}

export interface MonthlyExpense {
  id: number;
  month: string;
  month_index: number;
  year: number;
  cost: number;
  kwh: number;
}

export interface DailyBudget {
  id: number;
  room_id: number;
  date: string;
  today_cost: number;
  budget: number;
}

interface DeviceStore {
  devices: Device[];
  rooms: Room[];
  monthlyExpenses: MonthlyExpense[];
  dailyBudgets: DailyBudget[];
  selectedRoomId: number;
  utilityRate: number;

  fetchDevices: () => void;
  fetchRooms: () => void;
  fetchMonthlyExpenses: () => void;
  fetchDailyBudgets: () => void;
  fetchSettings: () => void;

  toggleDevice: (id: number, currentStatus: number) => void;
  updateDeviceProperty: (id: number, field: string, value: any) => void;
  updateTemperature: (roomId: number, temp: number) => void;
  addDevice: (name: string, type: string, roomId: number, energyRate: number, count: number, icon: string) => void;
  updateDevice: (id: number, name: string, type: string, roomId: number, energyRate: number, count: number, icon: string) => void;
  removeDevice: (id: number) => void;

  getTotalExpenses: () => number;
  getTotalKwh: () => number;
  getProjectedBill: () => number;
  getForecast: () => { total: number; trend: string };
  startSimulationEngine: () => void;
}

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  devices: [],
  rooms: [],
  monthlyExpenses: [],
  dailyBudgets: [],
  selectedRoomId: 1,
  utilityRate: 0.12,

  fetchDevices: () => {
    try {
      const result = db.getAllSync('SELECT * FROM devices') as Device[];
      set({ devices: result || [] });
    } catch (e) {
      console.log('FETCH DEVICES ERROR:', e);
    }
  },

  fetchRooms: () => {
    try {
      const result = db.getAllSync('SELECT * FROM rooms') as Room[];
      set({ rooms: result || [] });
    } catch (e) {
      console.log('FETCH ROOMS ERROR:', e);
    }
  },

  fetchMonthlyExpenses: () => {
    try {
      const result = db.getAllSync('SELECT * FROM monthly_expenses ORDER BY year DESC, month_index DESC') as MonthlyExpense[];
      set({ monthlyExpenses: result || [] });
    } catch (e) {
      console.log('FETCH EXPENSES ERROR:', e);
    }
  },

  fetchDailyBudgets: () => {
    try {
      const result = db.getAllSync('SELECT * FROM daily_budget') as DailyBudget[];
      set({ dailyBudgets: result || [] });
    } catch (e) {
      console.log('FETCH BUDGETS ERROR:', e);
    }
  },

  fetchSettings: () => {
    // Utility rate fetching logic...
  },

  toggleDevice: (id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    db.runSync('UPDATE devices SET status = ? WHERE id = ?', [newStatus, id]);
    get().fetchDevices();
  },

  updateDeviceProperty: (id, field, value) => {
    db.runSync(`UPDATE devices SET ${field} = ? WHERE id = ?`, [value, id]);
    get().fetchDevices();
  },

  updateTemperature: (roomId, temp) => {
    db.runSync('UPDATE rooms SET temperature = ? WHERE id = ?', [temp, roomId]);
    get().fetchRooms();
  },

  addDevice: (name, type, roomId, energyRate, count, icon) => {
    try {
      db.runSync(
        'INSERT INTO devices (name, type, room_id, energy_rate, device_count, icon, status, monthly_cost, today_cost, usage_hours) VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, 0)',
        [name, type, roomId, energyRate, count, icon]
      );
      get().fetchDevices();
    } catch (e) {
      console.log('ADD DEVICE ERROR:', e);
    }
  },

  updateDevice: (id, name, type, roomId, energyRate, count, icon) => {
    try {
      db.runSync(
        'UPDATE devices SET name = ?, type = ?, room_id = ?, energy_rate = ?, device_count = ?, icon = ? WHERE id = ?',
        [name, type, roomId, energyRate, count, icon, id]
      );
      get().fetchDevices();
    } catch (e) {
      console.log('UPDATE DEVICE ERROR:', e);
    }
  },

  removeDevice: (id) => {
    try {
      db.runSync('DELETE FROM devices WHERE id = ?', [id]);
      get().fetchDevices();
    } catch (e) {
      console.log('REMOVE DEVICE ERROR:', e);
    }
  },

  getTotalExpenses: () => {
    return get().devices.reduce((sum, d) => sum + (d.monthly_cost || 0), 0);
  },

  getTotalKwh: () => {
    return get().getTotalExpenses() / (get().utilityRate || 0.12);
  },

  getProjectedBill: () => {
    const { devices, utilityRate } = get();
    const spent = devices.reduce((sum, d) => sum + (d.monthly_cost || 0), 0);

    // Calculate current hourly burn rate (Watts to kW * utility rate)
    const currentHourlyBurn = devices
      .filter(d => d.status === 1)
      .reduce((sum, d) => sum + (d.energy_rate * d.device_count / 1000) * utilityRate, 0);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const totalHoursInMonth = lastDayOfMonth.getDate() * 24;

    // Calculate remaining hours from 'now' until end of month
    const hoursElapsed = (now.getDate() - 1) * 24 + now.getHours() + (now.getMinutes() / 60);
    const remainingHours = Math.max(0, totalHoursInMonth - hoursElapsed);

    // Forecast = Spent + (Reactive burn rate * hours left)
    return spent + (currentHourlyBurn * remainingHours);
  },

  getForecast: () => {
    return { total: get().getProjectedBill(), trend: 'Stable' };
  },

  startSimulationEngine: () => {
    if ((global as any).hpSimInterval) return;
    (global as any).hpSimInterval = setInterval(() => {
      // 1. Always refresh memory first
      get().fetchDevices();

      const { devices, utilityRate } = get();
      const safeRate = utilityRate || 0.12;
      const active = (devices || []).filter(d => d.status === 1);

      if (active.length > 0) {
        const SIM_MULTIPLIER = 5; // 30x speed for realistic movement

        active.forEach(d => {
          const kwhPerSecond = ((d.energy_rate * (d.device_count || 1)) / 3600 / 1000) * SIM_MULTIPLIER;
          const costPerSecond = kwhPerSecond * safeRate;
          const hoursInc = (1 / 3600) * SIM_MULTIPLIER;

          db.runSync(
            'UPDATE devices SET monthly_cost = COALESCE(monthly_cost, 0) + ?, today_cost = COALESCE(today_cost, 0) + ?, usage_hours = COALESCE(usage_hours, 0) + ? WHERE id = ?',
            [costPerSecond, costPerSecond, hoursInc, d.id]
          );
        });
      }
    }, 1000);
  }
}));