import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const dbPath = path.resolve('data/visits.db');
const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS visit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT,
    country TEXT,
    province TEXT,
    city TEXT,
    isp TEXT,
    platform TEXT,
    device_vendor TEXT,
    device_model TEXT,
    browser TEXT,
    browser_ver TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
