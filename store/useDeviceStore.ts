import { create } from 'zustand';
import { db } from '../db/db';

export interface Device {
  id: number;
  name: string;
  type: string;
  room_id: number;
  status: number;
  energy_rate: number;
  device_count: number;
  monthly_cost: number;
  icon: string;
  last_toggled: string | null;
  usage_hours: number;
}

export interface Room {
  id: number;
  name: string;
  temperature: number;
  icon: string;
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
  selectedRoomId: number;
  monthlyExpenses: MonthlyExpense[];
  dailyBudgets: DailyBudget[];

  fetchDevices: () => void;
  fetchDevicesByRoom: (roomId: number) => Device[];
  fetchRooms: () => void;
  fetchMonthlyExpenses: () => void;
  fetchDailyBudgets: () => void;
  
  setSelectedRoom: (roomId: number) => void;
  
  // CRUD
  addDevice: (name: string, type: string, roomId: number, energyRate: number, count: number, icon: string) => void;
  updateDevice: (id: number, name: string, type: string, roomId: number, energyRate: number, count: number, icon: string) => void;
  removeDevice: (id: number) => void;
  toggleDevice: (id: number, currentStatus: number) => void;
  
  addRoom: (name: string, icon: string) => void;
  removeRoom: (id: number) => void;
  updateTemperature: (roomId: number, temp: number) => void;
  updateBudget: (roomId: number, budget: number) => void;
  removeMonthlyExpense: (id: number) => void;
  
  // Simulation
  startSimulationEngine: () => void;
  simulateMonthEnd: () => void;
  
  // Computed & Utils
  getTotalExpenses: () => number;
  getDeviceExpensesByRoom: (roomId: number) => Device[];
  getRoomById: (roomId: number) => Room | undefined;
  getDailyBudgetByRoom: (roomId: number) => DailyBudget | undefined;
}

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  devices: [],
  rooms: [],
  selectedRoomId: 1,
  monthlyExpenses: [],
  dailyBudgets: [],

  fetchDevices: () => {
    try {
      const result = db.getAllSync('SELECT * FROM devices') as Device[];
      set({ devices: result });
    } catch (e) {
      console.log('FETCH DEVICES ERROR:', e);
    }
  },

  fetchDevicesByRoom: (roomId: number) => {
    return get().devices.filter(d => d.room_id === roomId);
  },

  fetchRooms: () => {
    try {
      const result = db.getAllSync('SELECT * FROM rooms') as Room[];
      set({ rooms: result });
    } catch (e) {
      console.log('FETCH ROOMS ERROR:', e);
    }
  },

  fetchMonthlyExpenses: () => {
    try {
      const result = db.getAllSync('SELECT * FROM monthly_expenses ORDER BY year DESC, month_index DESC') as MonthlyExpense[];
      set({ monthlyExpenses: result });
    } catch (e) {
      console.log('FETCH EXPENSES ERROR:', e);
    }
  },

  fetchDailyBudgets: () => {
    try {
      const result = db.getAllSync('SELECT * FROM daily_budget') as DailyBudget[];
      set({ dailyBudgets: result });
    } catch (e) {
      console.log('FETCH BUDGETS ERROR:', e);
    }
  },

  setSelectedRoom: (roomId: number) => {
    set({ selectedRoomId: roomId });
  },

  addDevice: (name, type, roomId, energyRate, count, icon) => {
    db.runSync(
      'INSERT INTO devices (name, type, room_id, energy_rate, device_count, monthly_cost, icon, status, usage_hours) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)',
      [name, type, roomId, energyRate, count, 0, icon]
    );
    get().fetchDevices();
  },

  removeDevice: (id) => {
    db.runSync('DELETE FROM devices WHERE id = ?', [id]);
    get().fetchDevices();
  },

  updateDevice: (id, name, type, roomId, energyRate, count, icon) => {
    db.runSync(
      'UPDATE devices SET name = ?, type = ?, room_id = ?, energy_rate = ?, device_count = ?, icon = ? WHERE id = ?',
      [name, type, roomId, energyRate, count, icon, id]
    );
    get().fetchDevices();
  },

  toggleDevice: (id: number, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const now = new Date().toISOString();
    
    // If turning off, we would calculate usage_hours here based on last_toggled. 
    // Simplified calculation for demo.
    db.runSync(
      'UPDATE devices SET status = ?, last_toggled = ? WHERE id = ?',
      [newStatus, now, id]
    );
    
    // Also simulate adding some cost when turned off
    if (newStatus === 0) {
      const device = get().devices.find(d => d.id === id);
      if (device) {
         const addedCost = (device.energy_rate * device.device_count * 0.5); // artificial cost addition
         db.runSync(
           'UPDATE devices SET monthly_cost = monthly_cost + ? WHERE id = ?',
           [addedCost, id]
         );
      }
    }

    get().fetchDevices();
  },

  addRoom: (name, icon) => {
    db.runSync('INSERT INTO rooms (name, temperature, icon) VALUES (?, 24, ?)', [name, icon]);
    get().fetchRooms();
  },

  removeRoom: (id) => {
    db.runSync('DELETE FROM devices WHERE room_id = ?', [id]);
    db.runSync('DELETE FROM rooms WHERE id = ?', [id]);
    db.runSync('DELETE FROM daily_budget WHERE room_id = ?', [id]);
    get().fetchRooms();
    get().fetchDevices();
    get().fetchDailyBudgets();
  },

  updateTemperature: (roomId, temp) => {
    db.runSync('UPDATE rooms SET temperature = ? WHERE id = ?', [temp, roomId]);
    get().fetchRooms();
  },

  updateBudget: (roomId, budget) => {
    db.runSync('UPDATE daily_budget SET budget = ? WHERE room_id = ?', [budget, roomId]);
    get().fetchDailyBudgets();
  },

  removeMonthlyExpense: (id) => {
    db.runSync('DELETE FROM monthly_expenses WHERE id = ?', [id]);
    get().fetchMonthlyExpenses();
  },

  getTotalExpenses: () => {
    const devices = get().devices;
    return devices.reduce((sum, d) => sum + d.monthly_cost, 0);
  },

  getDeviceExpensesByRoom: (roomId: number) => {
    return get().devices.filter(d => d.room_id === roomId);
  },

  getRoomById: (roomId: number) => {
    return get().rooms.find(r => r.id === roomId);
  },

  getDailyBudgetByRoom: (roomId: number) => {
    return get().dailyBudgets.find(b => b.room_id === roomId);
  },

  simulateMonthEnd: () => {
    const total = get().getTotalExpenses();
    if (total === 0) return;

    const now = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = months[now.getMonth()];
    const monthIndex = now.getMonth();
    const year = now.getFullYear();

    // Check if month/year already exists using index (more robust)
    const existing = db.getFirstSync(
      'SELECT id, cost, kwh FROM monthly_expenses WHERE month_index = ? AND year = ?',
      [monthIndex, year]
    ) as { id: number; cost: number; kwh: number } | null;

    if (existing) {
      db.runSync(
        'UPDATE monthly_expenses SET cost = cost + ?, kwh = kwh + ? WHERE id = ?',
        [total, total * 5.8, existing.id]
      );
    } else {
      db.runSync(
        'INSERT INTO monthly_expenses (month, month_index, year, cost, kwh) VALUES (?, ?, ?, ?, ?)',
        [monthName, monthIndex, year, total, total * 5.8]
      );
    }

    // Reset device costs
    db.runSync('UPDATE devices SET monthly_cost = 0, usage_hours = 0');
    
    get().fetchDevices();
    get().fetchMonthlyExpenses();
  },

  startSimulationEngine: () => {
    // Prevent multiple intervals
    if ((global as any).hpSimInterval) return;

    (global as any).hpSimInterval = setInterval(() => {
      const activeDevices = get().devices.filter(d => d.status === 1);
      if (activeDevices.length === 0) return;

      activeDevices.forEach(device => {
        // Increment cost by energy_rate / 3600 (per second rate if rate is per hour)
        // We'll use a slightly faster simulation for visual feedback: rate / 60 (simulating 1 minute every 1 second)
        const increment = (device.energy_rate * device.device_count) / 60;
        
        db.runSync(
          'UPDATE devices SET monthly_cost = monthly_cost + ?, usage_hours = usage_hours + (1.0/60.0) WHERE id = ?',
          [increment, device.id]
        );
      });

      get().fetchDevices();
    }, 1000);
  },
}));