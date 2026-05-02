import { db } from './db';

export const createTables = () => {
  db.execSync(`

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      password TEXT,
      created_at TEXT,
      budget_limit REAL DEFAULT 500
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      temperature REAL DEFAULT 0,
      icon TEXT DEFAULT 'home'
    );

    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      type TEXT,
      room_id INTEGER,
      status INTEGER DEFAULT 0,
      energy_rate REAL DEFAULT 0,
      device_count INTEGER DEFAULT 1,
      monthly_cost REAL DEFAULT 0,
      icon TEXT DEFAULT 'bulb',
      last_toggled TEXT,
      usage_hours REAL DEFAULT 0,
      value REAL DEFAULT 0,
      mode TEXT DEFAULT 'auto',
      secondary_value REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id INTEGER,
      date TEXT,
      units REAL,
      cost REAL,
      hours REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS monthly_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT,
      month_index INTEGER,
      year INTEGER,
      cost REAL,
      kwh REAL
    );

    CREATE TABLE IF NOT EXISTS daily_budget (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER,
      date TEXT,
      today_cost REAL,
      budget REAL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    INSERT OR IGNORE INTO settings (key, value) VALUES ('utility_rate', '0.12');
  `);
};