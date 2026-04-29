import test from 'node:test';
import assert from 'node:assert';
import db from '../server/services/db.service.js';

test('database schema should have webrtc_ip and is_vpn columns', () => {
  const tableInfo = db.prepare("PRAGMA table_info(visit_logs)").all();
  const columnNames = tableInfo.map(column => column.name);
  
  assert.ok(columnNames.includes('webrtc_ip'), 'Column webrtc_ip missing');
  assert.ok(columnNames.includes('is_vpn'), 'Column is_vpn missing');
});
