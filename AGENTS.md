# AGENTS.md

## 项目概述

Node.js Express 服务，记录访客 IP、地理位置、设备信息，存入 SQLite，提供查询和统计 API。官网伪装为博客，后台需密码登录。

## 开发命令

```bash
npm start        # 生产启动
npm run dev      # 开发模式（node --watch 热重载）
```

无测试框架，无 lint/typecheck 配置。

## 架构

- `server/app.js` — 入口，Express 路由注册、session 中间件
- `server/controllers/visit.controller.js` — 访客记录、日志查询、统计
- `server/controllers/auth.controller.js` — login / logout 处理
- `server/middleware/auth.middleware.js` — session 登录验证，未登录重定向到 `/admin`
- `server/services/db.service.js` — SQLite 初始化（better-sqlite3，同步 API）
- `server/services/ip.service.js` — IP 地理查询（ip2region.js，异步）
- `data/ip2region.xdb` — IP 库文件，必须存在，否则地理信息全返回"未知"
- `data/visits.db` — SQLite 数据库，启动时自动创建表
- `public/index.html` — 伪装博客首页，页面加载时静默触发 `/v`
- `public/admin/index.html` — 后台登录页
- `public/admin/dashboard.html` — 后台数据页（服务端路由保护）
- `public/admin/js/login.js` — 登录表单逻辑

## 关键约定

- 项目使用 ES Module（`"type": "module"`），所有 `import` 必须带 `.js` 后缀
- `db.service.js` 使用 better-sqlite3（同步），`ip.service.js` 使用异步 API，混用时注意
- 数据库和 XDB 路径均用 `path.resolve('data/...')`，相对于**进程工作目录**，必须从项目根目录启动
- IP 解析格式：`国家|区域|省份|城市|ISP`，值为 `"0"` 时视为未知
- `/admin/dashboard` 由服务端路由 `sendFile` 提供，不是 express.static 直接暴露的，必须登录才能访问

## API 端点

| 路由 | 说明 |
|------|------|
| `GET /` | 伪装博客首页，静默触发 `/v` 记录 IP |
| `GET /v` | 记录当前访客信息（无需登录） |
| `GET /admin` | 后台登录页（express.static 提供） |
| `GET /admin/dashboard` | 后台数据页（需登录，服务端路由保护） |
| `POST /api/login` | 验证密码，写 session |
| `POST /api/logout` | 销毁 session |
| `GET /api/logs?page=1&limit=10&days=7` | 分页查询日志（需登录） |
| `GET /api/stats` | 今日/总计访问量 + 省份分布 Top10（需登录） |

## 环境变量

- `PORT`：服务端口，默认 `3000`
- `ADMIN_PASSWORD`：后台登录密码（必须设置）
- `SESSION_SECRET`：session 签名密钥（建议设置为随机字符串）
