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
  utilityRate: number; // New: $/kWh

  fetchDevices: () => void;
  fetchDevicesByRoom: (roomId: number) => Device[];
  fetchRooms: () => void;
  fetchMonthlyExpenses: () => void;
  fetchDailyBudgets: () => void;
  fetchSettings: () => void;
  
  setSelectedRoom: (roomId: number) => void;
  updateUtilityRate: (rate: number) => void;
  
  // CRUD
  addDevice: (name: string, type: string, roomId: number, wattage: number, count: number, icon: string) => void;
  updateDevice: (id: number, name: string, type: string, roomId: number, wattage: number, count: number, icon: string) => void;
  updateDeviceProperty: (id: number, field: string, value: any) => void;
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
  generateHistory: () => void;
  syncAllRoomBudgets: () => void; // New
  calculateRoomBudget: (roomId: number) => number; // New
  
  // Computed & Utils
  getTotalExpenses: () => number;
  getTotalKwh: () => number;
  getForecast: () => { cost: number; trend: 'up' | 'down' | 'stable' };
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
  utilityRate: 0.12,

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

  fetchSettings: () => {
    try {
      const rate = db.getFirstSync('SELECT value FROM settings WHERE key = ?', ['utility_rate']) as { value: string } | null;
      if (rate) set({ utilityRate: parseFloat(rate.value) });
    } catch (e) {
      console.log('FETCH SETTINGS ERROR:', e);
    }
  },

  setSelectedRoom: (roomId: number) => {
    set({ selectedRoomId: roomId });
  },

  updateUtilityRate: (rate: number) => {
    db.runSync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ['utility_rate', rate.toString()]);
    set({ utilityRate: rate });
  },

  updateDeviceProperty: (id: number, field: string, value: any) => {
    try {
      db.runSync(`UPDATE devices SET ${field} = ? WHERE id = ?`, [value, id]);
      get().fetchDevices();
    } catch (e) {
      console.log('UPDATE PROPERTY ERROR:', e);
    }
  },

  addDevice: (name, type, roomId, wattage, count, icon) => {
    db.runSync(
      'INSERT INTO devices (name, type, room_id, energy_rate, device_count, monthly_cost, icon, status, usage_hours) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)',
      [name, type, roomId, wattage, count, 0, icon]
    );
    get().fetchDevices();
  },

  removeDevice: (id) => {
    db.runSync('DELETE FROM devices WHERE id = ?', [id]);
    get().fetchDevices();
  },

  updateDevice: (id, name, type, roomId, wattage, count, icon) => {
    db.runSync(
      'UPDATE devices SET name = ?, type = ?, room_id = ?, energy_rate = ?, device_count = ?, icon = ? WHERE id = ?',
      [name, type, roomId, wattage, count, icon, id]
    );
    get().fetchDevices();
  },

  toggleDevice: (id: number, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    const now = new Date().toISOString();
    try {
      db.runSync(
        'UPDATE devices SET status = ?, last_toggled = ? WHERE id = ?',
        [newStatus, now, id]
      );
      
      // Atomic state update to prevent "reversion"
      const updatedDevices = get().devices.map(d => 
        d.id === id ? { ...d, status: newStatus, last_toggled: now } : d
      );
      set({ devices: updatedDevices });
    } catch (e) {
      console.log('TOGGLE ERROR:', e);
    }
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
    return get().devices.reduce((sum, d) => sum + d.monthly_cost, 0);
  },

  getTotalKwh: () => {
    const totalCost = get().getTotalExpenses();
    return totalCost / get().utilityRate;
  },

  getForecast: () => {
    const currentCost = get().getTotalExpenses();
    const now = new Date();
    const day = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    // Simple projection
    const forecast = (currentCost / day) * daysInMonth;
    
    // Trend logic
    const prevMonth = get().monthlyExpenses[0]?.cost || 0;
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (forecast > prevMonth * 1.05) trend = 'up';
    else if (forecast < prevMonth * 0.95) trend = 'down';
    
    return { cost: forecast, trend };
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

  calculateRoomBudget: (roomId: number) => {
    const devices = get().devices.filter(d => d.room_id === roomId);
    const utilityRate = get().utilityRate;
    
    // Typical hours per day for different types (Maximum Realistic / Heavy Use)
    const usageHours: Record<string, number> = {
      light: 12,     // 12 hours (Evening + overnight)
      ac: 18,        // 18 hours (Almost all day/night)
      tv: 8,         // 8 hours (Heavy viewing)
      music: 6,      // 6 hours
      blinds: 0.2,
      default: 10    // 10 hours for generic items
    };

    const baseMonthlyCost = devices.reduce((sum, d) => {
      const hours = usageHours[d.type] || usageHours.default;
      const kwh = (d.energy_rate * d.device_count * hours * 30) / 1000;
      return sum + (kwh * utilityRate);
    }, 0);

    // Add a 25% buffer + a $15.00 flat "Connection/Infra" fee per room
    const finalMonthlyCost = (baseMonthlyCost * 1.25) + 15.0;

    return finalMonthlyCost;
  },

  syncAllRoomBudgets: () => {
    const { rooms } = get();
    rooms.forEach(room => {
      const recommended = get().calculateRoomBudget(room.id);
      // Update or Insert into daily_budget (we use it as a monthly budget record here)
      const existing = db.getFirstSync('SELECT id FROM daily_budget WHERE room_id = ?', [room.id]);
      if (existing) {
        db.runSync('UPDATE daily_budget SET budget = ? WHERE room_id = ?', [recommended, room.id]);
      } else {
        db.runSync('INSERT INTO daily_budget (room_id, budget, today_cost, date) VALUES (?, ?, 0, ?)', [room.id, recommended, new Date().toISOString()]);
      }
    });
    get().fetchDailyBudgets();
  },

  simulateMonthEnd: () => {
    const total = get().getTotalExpenses();
    const kwh = get().getTotalKwh();
    if (total === 0) return;

    const now = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = months[now.getMonth()];
    const monthIndex = now.getMonth();
    const year = now.getFullYear();

    const existing = db.getFirstSync(
      'SELECT id FROM monthly_expenses WHERE month_index = ? AND year = ?',
      [monthIndex, year]
    ) as { id: number } | null;

    if (existing) {
      db.runSync(
        'UPDATE monthly_expenses SET cost = cost + ?, kwh = kwh + ? WHERE id = ?',
        [total, kwh, existing.id]
      );
    } else {
      db.runSync(
        'INSERT INTO monthly_expenses (month, month_index, year, cost, kwh) VALUES (?, ?, ?, ?, ?)',
        [monthName, monthIndex, year, total, kwh]
      );
    }

    db.runSync('UPDATE devices SET monthly_cost = 0, usage_hours = 0');
    get().fetchDevices();
    get().fetchMonthlyExpenses();
  },

  generateHistory: () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const now = new Date();
    
    db.runSync('DELETE FROM monthly_expenses');
    
    // Generate 6 months of back-data
    for (let i = 6; i >= 1; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const yr = d.getFullYear();
      const mName = months[mIdx];
      
      // Realistic fluctuation: $80 - $150
      const baseCost = 80 + Math.random() * 70;
      // Seasonal peak in summer (July-Aug) or winter (Jan-Feb)
      const multiplier = (mIdx === 6 || mIdx === 7 || mIdx === 0 || mIdx === 1) ? 1.4 : 1.0;
      const finalCost = baseCost * multiplier;
      const finalKwh = finalCost / get().utilityRate;

      db.runSync(
        'INSERT INTO monthly_expenses (month, month_index, year, cost, kwh) VALUES (?, ?, ?, ?, ?)',
        [mName, mIdx, yr, finalCost, finalKwh]
      );
    }
    get().fetchMonthlyExpenses();
  },

  startSimulationEngine: () => {
    if ((global as any).hpSimInterval) return;

    (global as any).hpSimInterval = setInterval(() => {
      const { devices, utilityRate } = get();
      const activeDevices = devices.filter(d => d.status === 1);
      if (activeDevices.length === 0) return;

      activeDevices.forEach(device => {
        // energy_rate is now Watts. 
        // 1 second simulation = 1 minute of real time
        // kWh = (Watts * hours) / 1000
        // cost = kWh * utilityRate
        const hours = 1 / 60; 
        const kwh = (device.energy_rate * device.device_count * hours) / 1000;
        const costIncrement = kwh * utilityRate;
        
        db.runSync(
          'UPDATE devices SET monthly_cost = monthly_cost + ?, usage_hours = usage_hours + ? WHERE id = ?',
          [costIncrement, hours, device.id]
        );
      });

      get().fetchDevices();
    }, 1000);
  },
}));