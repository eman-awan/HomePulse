import { create } from 'zustand';
import { db } from '../db/db';

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  budget_limit: number;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  checkAuth: () => void;
  updateBudget: (budget: number) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      // Small artificial delay for UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const user = db.getFirstSync(
        'SELECT id, name, email, created_at, budget_limit FROM users WHERE email = ? AND password = ?', 
        [email, password]
      ) as User | undefined;

      if (user) {
        set({ user, isAuthenticated: true, isLoading: false });
        return { success: true };
      }
      
      set({ isLoading: false });
      return { success: false, message: 'Invalid email or password' };
    } catch (e) {
      set({ isLoading: false });
      return { success: false, message: 'An error occurred during login' };
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const existing = db.getFirstSync('SELECT id FROM users WHERE email = ?', [email]);
      if (existing) {
        set({ isLoading: false });
        return { success: false, message: 'Email already in use' };
      }

      const now = new Date().toISOString();
      const result = db.runSync(
        'INSERT INTO users (name, email, password, created_at, budget_limit) VALUES (?, ?, ?, ?, ?)',
        [name, email, password, now, 500]
      );

      const user: User = {
        id: result.lastInsertRowId,
        name,
        email,
        created_at: now,
        budget_limit: 500
      };

      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (e) {
      set({ isLoading: false });
      return { success: false, message: 'An error occurred during signup' };
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: () => {
    // In a real app we'd check AsyncStorage/SecureStore for a session token here
    // For this demo with SQLite, we just rely on in-memory state or fetch the last user if we wanted persistence across reloads
  },

  updateBudget: (budget: number) => {
    const user = get().user;
    if (user) {
      db.runSync('UPDATE users SET budget_limit = ? WHERE id = ?', [budget, user.id]);
      set({ user: { ...user, budget_limit: budget } });
    }
  }
}));
