import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const dbPath = path.resolve('data/visits.db');
const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS visit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT,
    webrtc_ip TEXT,
    is_vpn INTEGER DEFAULT 0,
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

try {
  db.exec("ALTER TABLE visit_logs ADD COLUMN webrtc_ip TEXT");
} catch (e) {}

try {
  db.exec("ALTER TABLE visit_logs ADD COLUMN is_vpn INTEGER DEFAULT 0");
} catch (e) {}

try {
  db.exec("ALTER TABLE visit_logs ADD COLUMN webrtc_country TEXT");
} catch (e) {}

try {
  db.exec("ALTER TABLE visit_logs ADD COLUMN webrtc_province TEXT");
} catch (e) {}

try {
  db.exec("ALTER TABLE visit_logs ADD COLUMN webrtc_city TEXT");
} catch (e) {}

try {
  db.exec("ALTER TABLE visit_logs ADD COLUMN webrtc_isp TEXT");
} catch (e) {}

export default db;
