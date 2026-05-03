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
      category TEXT DEFAULT 'Other', -- e.g. Cooling, Lighting, Entertainment
      room_id INTEGER,
      status INTEGER DEFAULT 0,
      energy_rate REAL DEFAULT 0, -- Watts
      device_count INTEGER DEFAULT 1,
      monthly_cost REAL DEFAULT 0,
      icon TEXT DEFAULT 'bulb',
      last_toggled TEXT,
      usage_hours REAL DEFAULT 0,
      value REAL DEFAULT 0,
      mode TEXT DEFAULT 'auto',
      secondary_value REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS monthly_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT,
      month_index INTEGER,
      year INTEGER,
      cost REAL,
      kwh REAL
    );

    CREATE TABLE IF NOT EXISTS usage_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id INTEGER,
      start_time TEXT,
      end_time TEXT,
      duration_minutes INTEGER,
      kwh REAL,
      cost REAL
    );

    CREATE TABLE IF NOT EXISTS automation_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      device_id INTEGER,
      trigger_type TEXT, -- 'time', 'cost_limit', 'duration'
      threshold REAL,
      action TEXT, -- 'alert', 'turn_off'
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    INSERT OR IGNORE INTO settings (key, value) VALUES ('utility_rate', '0.12');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('currency', '$');
  `);

  // Migration: Add new columns if they don't exist
  try { db.execSync('ALTER TABLE devices ADD COLUMN usage_hours REAL DEFAULT 0;'); } catch (e) {}
  try { db.execSync('ALTER TABLE devices ADD COLUMN value REAL DEFAULT 0;'); } catch (e) {}
  try { db.execSync('ALTER TABLE devices ADD COLUMN mode TEXT DEFAULT "auto";'); } catch (e) {}
  try { db.execSync('ALTER TABLE devices ADD COLUMN today_cost REAL DEFAULT 0;'); } catch (e) {}
  try { db.execSync('ALTER TABLE devices ADD COLUMN secondary_value REAL DEFAULT 0;'); } catch (e) {}

  // Fix NULL values for simulation math
  db.runSync(`
    UPDATE devices SET 
      today_cost = COALESCE(today_cost, 0),
      monthly_cost = COALESCE(monthly_cost, 0),
      usage_hours = COALESCE(usage_hours, 0)
  `);

  // Seed data logic...
  db.runSync('UPDATE devices SET energy_rate = 1500 WHERE type = "ac" OR name LIKE "%AC%"');
  db.runSync('UPDATE devices SET energy_rate = 100 WHERE type = "tv" OR name LIKE "%TV%"');
  db.runSync('UPDATE devices SET energy_rate = 75 WHERE type = "fan" OR name LIKE "%Fan%"');
  db.runSync('UPDATE devices SET energy_rate = 15 WHERE type = "bulb" OR name LIKE "%Light%"');

  // Refresh Historical Data with user-requested range (3000 - 5000)
  db.runSync('DELETE FROM monthly_expenses');
  db.runSync(`
    INSERT INTO monthly_expenses (id, month, month_index, year, cost, kwh) VALUES 
    (1, 'January', 0, 2026, 3240.00, 27000.0),
    (2, 'February', 1, 2026, 3120.00, 26000.0),
    (3, 'March', 2, 2026, 3850.00, 32083.0),
    (4, 'April', 3, 2026, 4420.00, 36833.0),
    (5, 'May', 4, 2026, 0.0, 0.0);
  `);
};