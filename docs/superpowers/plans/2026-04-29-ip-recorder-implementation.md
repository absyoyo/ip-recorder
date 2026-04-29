# IP Recorder 'Delta Force' Theme & WebRTC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a 'Delta Force' themed frontend, WebRTC IP detection, and VPN usage analysis for the IP recorder.

**Architecture:** Extended visit logging to capture WebRTC IPs, server-side VPN detection by comparing IPs, and a themed dashboard with visual alerts.

**Tech Stack:** Node.js, Express, better-sqlite3, Vanilla CSS, WebRTC (RTCPeerConnection).

---

### Task 1: Update Database Schema

**Files:**
- Modify: `server/services/db.service.js`

- [ ] **Step 1: Add webrtc_ip and is_vpn columns**

```javascript
// In server/services/db.service.js
// Update the CREATE TABLE statement
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
```

- [ ] **Step 2: Run migration (manual check)**

Run: `node server/services/db.service.js` (Note: Better to run app.js or a separate migration script if needed, but since it's IF NOT EXISTS, we might need to manually ALTER if table exists).
Actually, for simplicity in this project, I'll add a check/alter logic.

```javascript
try {
  db.exec("ALTER TABLE visit_logs ADD COLUMN webrtc_ip TEXT");
  db.exec("ALTER TABLE visit_logs ADD COLUMN is_vpn INTEGER DEFAULT 0");
} catch (e) {
  // Columns might already exist
}
```

- [ ] **Step 3: Commit**

```bash
git add server/services/db.service.js
git commit -m "db: add webrtc_ip and is_vpn columns"
```

---

### Task 2: Update Visit Controller Logic

**Files:**
- Modify: `server/controllers/visit.controller.js`

- [ ] **Step 1: Update logVisit to handle webrtc_ip and VPN logic**

```javascript
// In server/controllers/visit.controller.js
export const logVisit = async (req, res) => {
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  // ... (existing IP cleanup)
  
  const { webrtc_ip } = req.query; // Assume sent via query param for now
  const is_vpn = (webrtc_ip && webrtc_ip !== ip) ? 1 : 0;

  // Update INSERT statement
  const stmt = db.prepare(`
    INSERT INTO visit_logs (
      ip, webrtc_ip, is_vpn, country, province, city, isp, 
      platform, device_vendor, device_model, 
      browser, browser_ver, user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    ip, webrtc_ip || null, is_vpn,
    // ... (rest of geo and UA info)
  );
  // ...
}
```

- [ ] **Step 2: Run tests (Manual Verification)**

Run: `curl "http://localhost:3000/v?webrtc_ip=1.2.3.4"`
Expected: Success response.

- [ ] **Step 3: Commit**

```bash
git add server/controllers/visit.controller.js
git commit -m "feat: implement VPN detection logic in visit controller"
```

---

### Task 3: Implement WebRTC Detection in Frontend

**Files:**
- Modify: `public/index.html`
- Create: `public/js/webrtc.js`

- [ ] **Step 1: Write WebRTC IP detection script**

```javascript
// public/js/webrtc.js
async function getWebRTCIP() {
  return new Promise((resolve) => {
    const pc = new RTCPeerConnection({ iceServers: [] });
    pc.createDataChannel('');
    pc.createOffer().then(offer => pc.setLocalDescription(offer));
    pc.onicecandidate = (ice) => {
      if (!ice || !ice.candidate || !ice.candidate.candidate) return;
      const myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(ice.candidate.candidate)[1];
      pc.onicecandidate = null;
      resolve(myIP);
    };
    setTimeout(() => resolve(null), 1000);
  });
}
```

- [ ] **Step 2: Integrate into index.html**

```html
<script src="/js/webrtc.js"></script>
<script>
  (async () => {
    const webrtcIp = await getWebRTCIP();
    fetch(`/v?webrtc_ip=${webrtcIp || ''}`).catch(() => {});
  })();
</script>
```

- [ ] **Step 3: Commit**

```bash
git add public/index.html public/js/webrtc.js
git commit -m "feat: add WebRTC IP detection to frontend"
```

---

### Task 4: 'Delta Force' Theme UI Implementation

**Files:**
- Modify: `public/index.html`
- Modify: `public/assets/style.css`

- [ ] **Step 1: Apply 'Delta Force' styles and assets**

```css
/* public/assets/style.css */
body {
  background: #040201 url('/assets/images/bg0.jpg') no-repeat center top;
  background-size: cover;
  color: #fff;
  font-family: 'Industry', 'Microsoft YaHei', sans-serif;
}
.logo {
  background: url('/assets/images/logo.png') no-repeat;
  width: 200px; height: 100px;
}
.footer {
  text-align: center;
  padding: 20px;
  color: #666;
}
```

- [ ] **Step 2: Update HTML structure to match interactive single-page**

Use assets: `logo.png`, `slg.png`, `btndown.png`.

- [ ] **Step 3: Commit**

```bash
git add public/index.html public/assets/style.css
git commit -m "style: implement Delta Force theme with local assets"
```

---

### Task 5: Admin Dashboard Enhancements

**Files:**
- Modify: `public/admin/dashboard.html`
- Modify: `public/admin/js/dashboard.js` (or similar script file)

- [ ] **Step 1: Update log table columns**

Add "WebRTC IP" and "Status" columns.

- [ ] **Step 2: Apply conditional formatting for VPN warnings**

```javascript
// In dashboard rendering logic
if (log.is_vpn) {
  row.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
  row.classList.add('vpn-warning');
}
```

- [ ] **Step 3: Commit**

```bash
git add public/admin/dashboard.html ...
git commit -m "feat: enhance admin dashboard with VPN warnings and dual IP display"
```
