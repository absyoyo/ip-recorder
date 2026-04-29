# 官网/后台拆分 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有单页面拆分为伪装博客官网（`/`）和密码保护后台（`/admin`），官网静默记录访客 IP。

**Architecture:** 官网替换 `public/index.html` 为博客风格静态页，页面加载时静默请求 `/v`；后台新增 `/admin` 登录页和 `/admin/dashboard` 数据页；服务端用 `express-session` 做 session 认证，密码存 `.env`，新增 `auth.middleware.js` 保护后台路由。

**Tech Stack:** Express, express-session, better-sqlite3, vanilla JS ES Module, CSS

---

## 文件变更清单

| 操作 | 路径 | 说明 |
|------|------|------|
| 修改 | `server/app.js` | 注册 session 中间件、`/admin` 路由 |
| 新建 | `server/middleware/auth.middleware.js` | 登录验证中间件 |
| 修改 | `server/controllers/visit.controller.js` | 无变化（复用） |
| 新建 | `server/controllers/auth.controller.js` | login / logout 处理 |
| 替换 | `public/index.html` | 伪装博客首页 |
| 新建 | `public/admin/index.html` | 后台登录页 |
| 新建 | `public/admin/dashboard.html` | 后台数据页（原 index.html 内容迁移） |
| 新建 | `public/admin/js/login.js` | 登录表单逻辑 |
| 修改 | `public/js/app.js` | 路径不变，供 dashboard.html 引用 |
| 修改 | `.env` / `.env.example` | 新增 `ADMIN_PASSWORD` |
| 修改 | `AGENTS.md` | 更新路由和架构说明 |

---

### Task 1: 安装 express-session

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装依赖**

```bash
npm install express-session@1.17.3
```

- [ ] **Step 2: 验证安装**

```bash
node -e "import('express-session').then(m => console.log('ok'))"
```

Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add express-session"
```

---

### Task 2: 配置 .env 和 auth 中间件

**Files:**
- Create: `server/middleware/auth.middleware.js`
- Modify: `.env`（若不存在则新建）

- [ ] **Step 1: 在 .env 中添加 ADMIN_PASSWORD**

在项目根目录 `.env` 文件末尾追加（若文件不存在则新建）：

```
ADMIN_PASSWORD=change_me_123
```

- [ ] **Step 2: 新建 auth.middleware.js**

```js
// server/middleware/auth.middleware.js
export function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  res.redirect('/admin');
}
```

- [ ] **Step 3: Commit**

```bash
git add server/middleware/auth.middleware.js .env
git commit -m "feat: add auth middleware and ADMIN_PASSWORD env"
```

---

### Task 3: 新建 auth controller

**Files:**
- Create: `server/controllers/auth.controller.js`

- [ ] **Step 1: 新建 auth.controller.js**

```js
// server/controllers/auth.controller.js
export const login = (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    req.session.authenticated = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ ok: false, message: '密码错误' });
};

export const logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
};
```

- [ ] **Step 2: Commit**

```bash
git add server/controllers/auth.controller.js
git commit -m "feat: add auth controller"
```

---

### Task 4: 更新 server/app.js

**Files:**
- Modify: `server/app.js`

- [ ] **Step 1: 替换 app.js 内容**

```js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import { logVisit, getLogs, getStats } from './controllers/visit.controller.js';
import { login, logout } from './controllers/auth.controller.js';
import { requireAuth } from './middleware/auth.middleware.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'ip-recorder-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 8 * 60 * 60 * 1000 }
}));

app.use(express.static(path.join(__dirname, '../public')));

app.get('/v', logVisit);

app.get('/api/logs', requireAuth, getLogs);
app.get('/api/stats', requireAuth, getStats);

app.post('/api/login', login);
app.post('/api/logout', logout);

app.get('/admin/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin/dashboard.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}/`);
  console.log(`Admin: http://localhost:${PORT}/admin`);
});

export default app;
```

- [ ] **Step 2: 在 .env 中补充 SESSION_SECRET**

```
SESSION_SECRET=replace_with_random_string
```

- [ ] **Step 3: Commit**

```bash
git add server/app.js .env
git commit -m "feat: wire session, auth routes, and admin dashboard route"
```

---

### Task 5: 替换官网 public/index.html（伪装博客）

**Files:**
- Modify: `public/index.html`

- [ ] **Step 1: 替换 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TechNotes - 技术随笔</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #f5f5f5; color: #333; }
    nav { background: #fff; border-bottom: 1px solid #e5e5e5; padding: 0 2rem; display: flex; align-items: center; justify-content: space-between; height: 56px; }
    nav .logo { font-weight: 700; font-size: 1.2rem; color: #111; text-decoration: none; }
    nav ul { list-style: none; display: flex; gap: 1.5rem; }
    nav ul a { text-decoration: none; color: #555; font-size: 0.9rem; }
    nav ul a:hover { color: #111; }
    .hero { background: #fff; border-bottom: 1px solid #e5e5e5; padding: 3rem 2rem; text-align: center; }
    .hero h1 { font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; }
    .hero p { color: #666; font-size: 1rem; }
    .container { max-width: 860px; margin: 2rem auto; padding: 0 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .card { background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 1.5rem; }
    .card .tag { display: inline-block; background: #eef2ff; color: #4f46e5; font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; margin-bottom: 0.75rem; }
    .card h2 { font-size: 1.05rem; font-weight: 600; margin-bottom: 0.5rem; line-height: 1.4; }
    .card p { font-size: 0.875rem; color: #666; line-height: 1.6; }
    .card .meta { margin-top: 1rem; font-size: 0.75rem; color: #999; }
    footer { text-align: center; padding: 2rem; font-size: 0.8rem; color: #aaa; border-top: 1px solid #e5e5e5; margin-top: 2rem; }
    @media (max-width: 600px) { .container { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <nav>
    <a class="logo" href="/">TechNotes</a>
    <ul>
      <li><a href="#">首页</a></li>
      <li><a href="#">分类</a></li>
      <li><a href="#">归档</a></li>
      <li><a href="#">关于</a></li>
    </ul>
  </nav>
  <div class="hero">
    <h1>技术随笔</h1>
    <p>记录开发过程中的思考与实践</p>
  </div>
  <div class="container">
    <div class="card">
      <span class="tag">前端</span>
      <h2>深入理解 CSS Grid 布局的自动放置算法</h2>
      <p>Grid 布局的自动放置算法决定了未显式定位的子元素如何排列，理解它能帮助你写出更简洁的布局代码。</p>
      <div class="meta">2026-04-20 · 阅读约 6 分钟</div>
    </div>
    <div class="card">
      <span class="tag">Node.js</span>
      <h2>用 better-sqlite3 替代异步 SQLite 驱动的实践</h2>
      <p>同步 API 在 I/O 密集型场景下并不总是劣势，本文分析了在 Express 中使用同步 SQLite 的适用场景。</p>
      <div class="meta">2026-04-15 · 阅读约 8 分钟</div>
    </div>
    <div class="card">
      <span class="tag">工具</span>
      <h2>ip2region：离线 IP 归属地查询的最佳实践</h2>
      <p>对比了多种离线 IP 库方案，介绍如何在 Node.js 中集成 ip2region 并处理边界情况。</p>
      <div class="meta">2026-04-08 · 阅读约 5 分钟</div>
    </div>
    <div class="card">
      <span class="tag">安全</span>
      <h2>Express Session 安全配置备忘录</h2>
      <p>涵盖 httpOnly、secure、sameSite 等 cookie 属性的含义，以及在反向代理后面正确配置 trust proxy 的方法。</p>
      <div class="meta">2026-03-30 · 阅读约 7 分钟</div>
    </div>
  </div>
  <footer>© 2026 TechNotes · 用 Node.js 驱动</footer>
  <script>
    fetch('/v').catch(() => {});
  </script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add public/index.html
git commit -m "feat: replace homepage with disguised blog"
```

---

### Task 6: 新建后台登录页 public/admin/index.html

**Files:**
- Create: `public/admin/index.html`
- Create: `public/admin/js/login.js`

- [ ] **Step 1: 新建 public/admin/index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>管理后台</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .box { background: rgba(30,41,59,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 2.5rem 2rem; width: 100%; max-width: 360px; }
    h1 { font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem; text-align: center; }
    label { display: block; font-size: 0.875rem; color: #94a3b8; margin-bottom: 0.4rem; }
    input[type=password] { width: 100%; padding: 0.6rem 0.9rem; background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #f8fafc; font-size: 0.95rem; outline: none; }
    input[type=password]:focus { border-color: #3b82f6; }
    button { margin-top: 1.25rem; width: 100%; padding: 0.65rem; background: #3b82f6; border: none; border-radius: 6px; color: #fff; font-size: 0.95rem; cursor: pointer; }
    button:hover { background: #2563eb; }
    .error { margin-top: 0.75rem; font-size: 0.8rem; color: #f87171; text-align: center; min-height: 1.2em; }
  </style>
</head>
<body>
  <div class="box">
    <h1>管理后台</h1>
    <label for="pwd">密码</label>
    <input type="password" id="pwd" placeholder="请输入密码" autofocus>
    <button id="btn">登录</button>
    <div class="error" id="err"></div>
  </div>
  <script src="js/login.js"></script>
</body>
</html>
```

- [ ] **Step 2: 新建 public/admin/js/login.js**

```js
const btn = document.getElementById('btn');
const pwd = document.getElementById('pwd');
const err = document.getElementById('err');

async function doLogin() {
  err.textContent = '';
  btn.disabled = true;
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd.value })
    });
    const data = await res.json();
    if (data.ok) {
      location.href = '/admin/dashboard';
    } else {
      err.textContent = data.message || '密码错误';
    }
  } catch {
    err.textContent = '网络错误，请重试';
  } finally {
    btn.disabled = false;
  }
}

btn.addEventListener('click', doLogin);
pwd.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
```

- [ ] **Step 3: Commit**

```bash
git add public/admin/index.html public/admin/js/login.js
git commit -m "feat: add admin login page"
```

---

### Task 7: 新建后台数据页 public/admin/dashboard.html

**Files:**
- Create: `public/admin/dashboard.html`

- [ ] **Step 1: 新建 dashboard.html（迁移原 index.html 内容）**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IP Analytics - 后台</title>
    <link rel="stylesheet" href="/assets/style.css">
    <style>
      .logout-btn { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #94a3b8; padding: 0.3rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.8rem; }
      .logout-btn:hover { border-color: #f87171; color: #f87171; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>IP Analytics</h1>
            <div class="stats-summary">
                <div class="stat-item">
                    <span class="stat-value" id="summary-online">--</span>
                    <span class="stat-label">正在运行</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value" id="summary-last-update">--</span>
                    <span class="stat-label">最后更新</span>
                </div>
                <div class="stat-item" style="display:flex;align-items:center;">
                    <button class="logout-btn" id="logout-btn">退出</button>
                </div>
            </div>
        </header>

        <section class="card card-today">
            <div class="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                今日访问
            </div>
            <div class="big-number" id="today-count">0</div>
            <div class="stat-label">次请求</div>
        </section>

        <section class="card card-total">
            <div class="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                累计访问
            </div>
            <div class="big-number" id="total-count">0</div>
            <div class="stat-label">历史总计</div>
        </section>

        <section class="card card-geo">
            <div class="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                地区分布
            </div>
            <div id="geo-list">
                <div style="color: var(--text-secondary); padding: 1rem 0;">等待数据加载...</div>
            </div>
        </section>

        <section class="card card-logs">
            <div class="controls">
                <div class="card-title" style="margin-bottom: 0;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    访问日志
                </div>
                <select id="time-filter">
                    <option value="all">全部时间</option>
                    <option value="today">今天</option>
                    <option value="yesterday">昨天</option>
                    <option value="7days">最近 7 天</option>
                    <option value="30days">最近 30 天</option>
                </select>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>时间</th>
                            <th>IP 地址</th>
                            <th>地区</th>
                            <th>用户代理</th>
                        </tr>
                    </thead>
                    <tbody id="log-body"></tbody>
                </table>
            </div>

            <div class="pagination" id="pagination"></div>
        </section>
    </div>

    <script type="module" src="/js/app.js"></script>
    <script>
      document.getElementById('logout-btn').addEventListener('click', async () => {
        await fetch('/api/logout', { method: 'POST' });
        location.href = '/admin';
      });
    </script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add public/admin/dashboard.html
git commit -m "feat: add admin dashboard page"
```

---

### Task 8: 更新 AGENTS.md

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: 更新 AGENTS.md 路由表和架构说明**

将 AGENTS.md 中的 API 端点表替换为：

```markdown
## API 端点

| 路由 | 说明 |
|------|------|
| `GET /` | 伪装博客首页，静默触发 `/v` 记录 IP |
| `GET /v` | 记录当前访客信息（无需登录） |
| `GET /admin` | 后台登录页（静态，express.static 提供） |
| `GET /admin/dashboard` | 后台数据页（需登录，服务端路由保护） |
| `POST /api/login` | 验证密码，写 session |
| `POST /api/logout` | 销毁 session |
| `GET /api/logs?page=1&limit=10&days=7` | 分页查询日志（需登录） |
| `GET /api/stats` | 今日/总计访问量 + 省份分布 Top10（需登录） |
```

并在架构节补充：

```markdown
- `server/middleware/auth.middleware.js` — session 登录验证，未登录重定向到 `/admin`
- `server/controllers/auth.controller.js` — login / logout 处理
- `public/admin/index.html` — 后台登录页
- `public/admin/dashboard.html` — 后台数据页
- `public/admin/js/login.js` — 登录表单逻辑
```

并在环境变量节补充：

```markdown
- `ADMIN_PASSWORD`：后台登录密码（必须设置）
- `SESSION_SECRET`：session 签名密钥（建议设置为随机字符串）
```

- [ ] **Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "docs: update AGENTS.md for frontend split"
```

---

### Task 9: 验证

- [ ] **Step 1: 启动服务**

```bash
npm run dev
```

- [ ] **Step 2: 验证官网**

访问 `http://localhost:3000/`，应看到博客页面，Network 面板中有 `/v` 请求。

- [ ] **Step 3: 验证后台保护**

直接访问 `http://localhost:3000/admin/dashboard`，应重定向到 `/admin`。

- [ ] **Step 4: 验证登录流程**

访问 `http://localhost:3000/admin`，输入 `.env` 中的 `ADMIN_PASSWORD`，应跳转到 dashboard 并显示数据。

- [ ] **Step 5: 验证 API 保护**

未登录状态下访问 `http://localhost:3000/api/stats`，应重定向到 `/admin`（302）。

- [ ] **Step 6: 验证退出**

点击 dashboard 右上角"退出"按钮，应跳回登录页，再次访问 dashboard 被拦截。
