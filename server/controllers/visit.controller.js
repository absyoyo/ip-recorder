import db from '../services/db.service.js';
import { getIpInfo } from '../services/ip.service.js';
import UAParser from 'ua-parser-js';

export const logVisit = async (req, res) => {
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  // 处理 x-forwarded-for 可能包含多个 IP 的情况
  if (ip && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }
  // 处理 IPv6 映射的 IPv4 地址 (::ffff:127.0.0.1)
  if (ip && ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  const ua = req.headers['user-agent'] || '';
  const parser = new UAParser(ua);
  const device = parser.getDevice();
  const os = parser.getOS();
  const browser = parser.getBrowser();

  const geo = await getIpInfo(ip);

  const { webrtc_ip } = req.query;
  const is_vpn = (webrtc_ip && webrtc_ip !== ip) ? 1 : 0;

  let webrtcGeo = { country: null, province: null, city: null, isp: null };
  if (webrtc_ip) {
    webrtcGeo = await getIpInfo(webrtc_ip);
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO visit_logs (
        ip, webrtc_ip, is_vpn, country, province, city, isp,
        webrtc_country, webrtc_province, webrtc_city, webrtc_isp,
        platform, device_vendor, device_model, 
        browser, browser_ver, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      ip,
      webrtc_ip || null,
      is_vpn,
      geo.country || '未知',
      geo.province || '未知',
      geo.city || '未知',
      geo.isp || '未知',
      webrtcGeo.country || null,
      webrtcGeo.province || null,
      webrtcGeo.city || null,
      webrtcGeo.isp || null,
      os.name || 'Unknown',
      device.vendor || 'Unknown',
      device.model || 'Unknown',
      browser.name || 'Unknown',
      browser.version || 'Unknown',
      ua
    );
  } catch (err) {
    console.error('Database insert error:', err);
  }

  res.json({ status: 'ok' });
};

export const getLogs = (req, res) => {
  const { page = 1, limit = 10, days = 7, start, end } = req.query;
  const offset = (Math.max(1, Number(page)) - 1) * Number(limit);
  
  try {
    let whereClause = '';
    let params = [];

    if (start && end) {
      whereClause = 'WHERE created_at >= ? AND created_at <= ?';
      params = [start, end, Number(limit), offset];
    } else {
      whereClause = 'WHERE created_at >= datetime(\'now\', ?)';
      params = [`-${days} days`, Number(limit), offset];
    }

    const logs = db.prepare(`
      SELECT * FROM visit_logs 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).all(...params);

    const countParams = start && end ? [start, end] : [`-${days} days`];
    const total = db.prepare(`
      SELECT COUNT(*) as count FROM visit_logs 
      ${whereClause}
    `).get(...countParams).count;

    res.json({ 
      logs, 
      total, 
      page: Number(page), 
      limit: Number(limit) 
    });
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getStats = (req, res) => {
  try {
    const todayCount = db.prepare(`
      SELECT COUNT(*) as count FROM visit_logs 
      WHERE created_at >= date('now')
    `).get().count;

    const totalCount = db.prepare(`
      SELECT COUNT(*) as count FROM visit_logs
    `).get().count;

    const geoDist = db.prepare(`
      SELECT province, COUNT(*) as count 
      FROM visit_logs 
      GROUP BY province 
      ORDER BY count DESC 
      LIMIT 10
    `).all();

    res.json({
      todayCount,
      totalCount,
      geoDist
    });
  } catch (err) {
    console.error('Database stats error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
