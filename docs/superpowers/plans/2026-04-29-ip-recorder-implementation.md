# IP 记录访问器实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个轻量级、跨平台的 IP 访问记录系统，具备离线归属地查询和 ui-ux-pro-max 风格的管理后台。

**Architecture:** 采用 Node.js (Express) + SQLite 架构。前端使用原生 ES Modules 实现组件化，静态资源完全本地化。通过 .bat 和 .sh 脚本实现 Windows/Linux 一键部署。

**Tech Stack:** Node.js, Express, better-sqlite3, ip2region-nodejs, ua-parser-js, Vanilla CSS/JS.

---

### Task 1: 项目初始化与环境搭建

**Files:**
- Create: `package.json`
- Create: `.gitignore`

- [ ] **Step 1: 创建 package.json**
```json
{
  "name": "ip-recorder",
  "version": "1.0.0",
  "main": "server/app.js",
  "type": "module",
  "scripts": {
    "start": "node server/app.js",
    "dev": "node --watch server/app.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "better-sqlite3": "^9.4.3",
    "ip2region-nodejs": "^1.1.2",
    "ua-parser-js": "^1.0.35",
    "dotenv": "^16.0.3"
  }
}
```

- [ ] **Step 2: 创建 .gitignore**
```text
node_modules/
data/visits.db
.env
```

- [ ] **Step 3: 安装依赖**
Run: `npm install`

- [ ] **Step 4: Commit**
```bash
git add package.json .gitignore
git commit -m "chore: project initialization"
```

---

### Task 2: 数据库与服务层实现 (Backend Core)

**Files:**
- Create: `server/services/db.service.js`
- Create: `server/services/ip.service.js`
- Create: `data/.gitkeep`

- [ ] **Step 1: 实现数据库服务 (SQLite)**
```javascript
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve('data/visits.db');
const db = new Database(dbPath);

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
```

- [ ] **Step 2: 实现 IP 定位服务**
需要确保 `data/ip2region.xdb` 存在（后续任务下载）。
```javascript
import { Searcher } from 'ip2region-nodejs';
import path from 'path';

export const getIpInfo = async (ip) => {
  const xdbPath = path.resolve('data/ip2region.xdb');
  const searcher = Searcher.newWithFileOnly(xdbPath);
  try {
    const data = await searcher.search(ip);
    // 格式: 国家|区域|省份|城市|ISP
    const [country, region, province, city, isp] = data.region.split('|');
    return { country, province, city, isp };
  } catch (e) {
    return { country: '未知', province: '未知', city: '未知', isp: '未知' };
  }
};
```

- [ ] **Step 3: Commit**
```bash
git add server/services/ data/.gitkeep
git commit -m "feat: database and ip services"
```

---

### Task 3: 后端 API 与中间件 (Routes & Controller)

**Files:**
- Create: `server/controllers/visit.controller.js`
- Create: `server/routes/api.js`
- Create: `server/app.js`

- [ ] **Step 1: 实现访问逻辑 Controller**
```javascript
import db from '../services/db.service.js';
import { getIpInfo } from '../services/ip.service.js';
import UAParser from 'ua-parser-js';

export const logVisit = async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const ua = req.headers['user-agent'];
  const parser = new UAParser(ua);
  const device = parser.getDevice();
  const os = parser.getOS();
  const browser = parser.getBrowser();

  const geo = await getIpInfo(ip);

  const stmt = db.prepare(`
    INSERT INTO visit_logs (
      ip, country, province, city, isp, 
      platform, device_vendor, device_model, 
      browser, browser_ver, user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    ip, geo.country, geo.province, geo.city, geo.isp,
    os.name || 'Unknown', device.vendor || 'Unknown', device.model || 'Unknown',
    browser.name || 'Unknown', browser.version || 'Unknown', ua
  );

  res.json({ status: 'ok' });
};

export const getLogs = (req, res) => {
  const { page = 1, limit = 10, days = 7 } = req.query;
  const offset = (page - 1) * limit;
  
  const logs = db.prepare(`
    SELECT * FROM visit_logs 
    WHERE created_at >= date('now', ?)
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `).all(`-${days} days`, limit, offset);

  const total = db.prepare(`SELECT COUNT(*) as count FROM visit_logs WHERE created_at >= date('now', ?)`).get(`-${days} days`).count;

  res.json({ logs, total, page: Number(page), limit: Number(limit) });
};
```

- [ ] **Step 2: 创建 App 入口**
```javascript
import express from 'express';
import path from 'path';
import { logVisit, getLogs } from './controllers/visit.controller.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// 记录访问
app.get('/v', logVisit);

// API 接口
app.get('/api/logs', getLogs);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

- [ ] **Step 3: Commit**
```bash
git add server/
git commit -m "feat: API routes and visit logging"
```

---

### Task 4: 前端本地化资源与 UI 基础 (Frontend Setup)

**Files:**
- Create: `public/index.html`
- Create: `public/assets/style.css`
- Create: `public/libs/.gitkeep`

- [ ] **Step 1: 编写基础 HTML (Bento Grid 结构)**
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IP 记录分析控制台</title>
    <link rel="stylesheet" href="assets/style.css">
</head>
<body class="dark-theme">
    <div class="container">
        <header class="glass-header">
            <h1>IP Monitoring</h1>
            <div id="stats-summary"></div>
        </header>
        <main class="bento-grid">
            <section class="card glass small" id="stat-today">今日访问: --</section>
            <section class="card glass small" id="stat-total">累计访问: --</section>
            <section class="card glass medium" id="geo-chart">地区分布</section>
            <section class="card glass large" id="log-table-container">
                <div class="table-header">
                    <h2>访问日志</h2>
                    <select id="time-filter">
                        <option value="1">今天</option>
                        <option value="3">最近3天</option>
                        <option value="7" selected>最近7天</option>
                    </select>
                </div>
                <div id="log-list"></div>
                <div id="pagination"></div>
            </section>
        </main>
    </div>
    <script type="module" src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: 编写 ui-ux-pro-max 样式 (Glassmorphism)**
```css
:root {
  --bg: #0f172a;
  --glass: rgba(255, 255, 255, 0.05);
  --border: rgba(255, 255, 255, 0.1);
  --accent: #3b82f6;
}

body {
  background: var(--bg);
  color: #f8fafc;
  font-family: 'Inter', sans-serif;
  margin: 0;
}

.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  padding: 2rem;
}

.glass {
  background: var(--glass);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: 1rem;
  padding: 1.5rem;
}

/* 响应式 */
@media (max-width: 768px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Commit**
```bash
git add public/
git commit -m "feat: frontend structure and styling"
```

---

### Task 5: 前端模块化逻辑 (Frontend Logic)

**Files:**
- Create: `public/js/app.js`
- Create: `public/js/utils/api.js`

- [ ] **Step 1: 实现 API 封装**
```javascript
export const fetchLogs = async (params) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/logs?${query}`);
  return res.json();
};
```

- [ ] **Step 2: 实现主应用逻辑**
```javascript
import { fetchLogs } from './utils/api.js';

const state = {
  page: 1,
  days: 7,
  logs: []
};

async function render() {
  const data = await fetchLogs({ page: state.page, days: state.days });
  const logList = document.getElementById('log-list');
  logList.innerHTML = data.logs.map(log => `
    <div class="log-item glass">
      <span>${new Date(log.created_at).toLocaleString()}</span>
      <span>${log.ip}</span>
      <span>${log.province} ${log.city}</span>
      <span>${log.platform}</span>
    </div>
  `).join('');
}

document.getElementById('time-filter').onchange = (e) => {
  state.days = e.target.value;
  render();
};

render();
```

- [ ] **Step 3: Commit**
```bash
git add public/js/
git commit -m "feat: frontend functional logic"
```

---

### Task 6: 部署脚本与资源本地化 (Deployment)

**Files:**
- Create: `scripts/install.sh`
- Create: `scripts/install.bat`
- Create: `scripts/start.sh`
- Create: `scripts/start.bat`

- [ ] **Step 1: 编写 Linux 安装脚本**
```bash
#!/bin/bash
npm install
mkdir -p data
# 下载 IP2Region 数据库 (示例 URL)
curl -L https://github.com/lionsoul2014/ip2region/raw/master/data/ip2region.xdb -o data/ip2region.xdb
echo "Installation complete."
```

- [ ] **Step 2: 编写 Windows 安装脚本**
```batch
@echo off
npm install
if not exist "data" mkdir data
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/lionsoul2014/ip2region/raw/master/data/ip2region.xdb' -OutFile 'data/ip2region.xdb'"
echo Installation complete.
pause
```

- [ ] **Step 3: Commit**
```bash
git add scripts/
git commit -m "feat: cross-platform deployment scripts"
```
