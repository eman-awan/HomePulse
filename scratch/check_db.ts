import { db } from './db/db';
const results = db.getAllSync('SELECT * FROM monthly_expenses');
console.log(JSON.stringify(results, null, 2));
