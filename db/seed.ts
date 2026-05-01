import { db } from './db';

export const seedDefaultData = () => {
  const result: any = db.getFirstSync('SELECT COUNT(*) as count FROM rooms');

  if (result.count === 0) {
    // Seed rooms
    db.execSync(`
      INSERT INTO rooms (name, temperature, icon) VALUES ('Living Room', 28, 'living');
      INSERT INTO rooms (name, temperature, icon) VALUES ('Bedroom', 24, 'bedroom');
      INSERT INTO rooms (name, temperature, icon) VALUES ('Kitchen', 30, 'kitchen');
      INSERT INTO rooms (name, temperature, icon) VALUES ('Garden', 32, 'garden');
    `);

    // Seed devices
    db.execSync(`
      INSERT INTO devices (name, type, room_id, status, energy_rate, device_count, monthly_cost, icon, last_toggled, usage_hours)
      VALUES
        ('Lightings', 'light', 1, 1, 5, 10, 50, 'bulb', datetime('now'), 0),
        ('Blinds', 'blinds', 1, 0, 2, 2, 10, 'blinds', datetime('now'), 0),
        ('Smart TV', 'tv', 1, 0, 10, 3, 30, 'tv', datetime('now'), 0),
        ('Air Condition', 'ac', 1, 1, 20, 4, 150, 'ac', datetime('now'), 0),
        ('Music System', 'music', 2, 0, 8, 8, 12, 'music', datetime('now'), 0),
        ('Lightings', 'light', 2, 1, 5, 8, 40, 'bulb', datetime('now'), 0),
        ('Smart TV', 'tv', 2, 0, 10, 9, 12, 'tv', datetime('now'), 0),
        ('Blinds', 'blinds', 2, 0, 2, 3, 10, 'blinds', datetime('now'), 0),
        ('Air Condition', 'ac', 3, 1, 20, 2, 80, 'ac', datetime('now'), 0),
        ('Lightings', 'light', 3, 1, 5, 6, 35, 'bulb', datetime('now'), 0),
        ('Lightings', 'light', 4, 0, 5, 4, 20, 'bulb', datetime('now'), 0),
        ('Smart TV', 'tv', 4, 0, 10, 2, 15, 'tv', datetime('now'), 0);
    `);

    // Dynamic Seed for monthly expenses (last 8 months)
    const monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    
    // We want to generate for the past 8 months
    for (let i = 7; i >= 0; i--) {
        let m = currentMonth - i;
        let y = currentYear;
        if (m < 0) {
            m += 12;
            y -= 1;
        }
        
        // Randomize cost around 300,000 to 500,000 for realistic looking values
        const randomCost = Math.floor(Math.random() * 200000) + 250000;
        const randomKwh = randomCost / 1200; // rough kwh calculation
        
        db.runSync(
            'INSERT INTO monthly_expenses (month, month_index, year, cost, kwh) VALUES (?, ?, ?, ?, ?)',
            [monthsList[m], m + 1, y, randomCost, randomKwh]
        );
    }

    // Seed daily budget with current date
    const todayStr = currentDate.toISOString().split('T')[0];
    db.runSync(`INSERT INTO daily_budget (room_id, date, today_cost, budget) VALUES (1, ?, 2.83, 4.03)`, [todayStr]);
    db.runSync(`INSERT INTO daily_budget (room_id, date, today_cost, budget) VALUES (2, ?, 1.50, 3.00)`, [todayStr]);
    db.runSync(`INSERT INTO daily_budget (room_id, date, today_cost, budget) VALUES (3, ?, 3.20, 5.00)`, [todayStr]);
    db.runSync(`INSERT INTO daily_budget (room_id, date, today_cost, budget) VALUES (4, ?, 0.80, 2.00)`, [todayStr]);
  }
};