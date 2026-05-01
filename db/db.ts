import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('homepulse_v2.db');