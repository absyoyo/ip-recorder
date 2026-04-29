# IP 记录访问器设计文档 (IP Recorder Spec)

## 1. 项目概述
本系统是一个用于记录和分析用户访问行为的轻量级工具。用户只需通过浏览器访问指定端口，系统即可自动抓取其 IP、地理位置、设备机型、系统平台等信息，并提供一个基于 **ui-ux-pro-max** 视觉规范的管理后台进行查看。

## 2. 核心功能
- **实时记录**：自动采集访问者的 IP、UA、时间等。
- **离线定位**：集成 IP2Region 数据库，实现无网络依赖的 IP 归属地查询。
- **设备识别**：精准解析访问者的机型（如 iPhone 15）、系统（如 Windows 11）及浏览器。
- **数据管理**：支持分页查询、按时间段（今天/近3天/近7天）筛选。
- **一键部署**：为 Windows 平台提供 BAT 脚本，简化环境初始化与启动。

## 3. 技术架构
### 3.1 后端 (Node.js)
- **核心框架**：Express
- **数据库**：SQLite (使用 `better-sqlite3` 驱动)
- **模块化划分**：
    - `app.js`：主入口，中间件配置。
    - `routes/`：定义访问记录 API 和静态页面路由。
    - `controllers/`：业务逻辑（处理访问记录、分页逻辑）。
    - `services/`：核心服务（IP 查询服务、UA 解析服务、数据库操作服务）。
    - `data/`：存放 `visits.db` 和 `ip2region.xdb`。

### 3.2 前端 (Vanilla CSS/JS)
- **视觉风格**：极简现代监控流 (Bento Grid + Glassmorphism)。
- **组件化 (ES Modules)**：
    - `public/js/app.js`：主逻辑入口。
    - `public/js/components/`：封装看板卡片、数据表格、分页器等。
    - `public/js/utils/`：时间处理、API 请求封装。
- **静态资源本地化**：
    - 所有外部库（Lucide Icons, Fonts）统一存放于 `public/libs/`，拒绝任何外部 CDN 引用。

## 4. 视觉设计规范 (ui-ux-pro-max)
- **色调**：深色模式。背景 `#0f172a` (Slate-900)，强调色 `#3b82f6` (Blue-500)。
- **质感**：磨砂玻璃卡片。`background: rgba(255, 255, 255, 0.05)`, `backdrop-filter: blur(12px)`, `border: 1px solid rgba(255, 255, 255, 0.1)`.
- **布局**：便当格布局 (Bento Grid)。PC 端 4 列响应式，移动端自动缩减为 1 列。

## 5. 数据模型
### 表名: `visit_logs`
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | INTEGER | 主键，自增 |
| ip | TEXT | 访问者 IP |
| country | TEXT | 国家 |
| province | TEXT | 省份 |
| city | TEXT | 城市 |
| isp | TEXT | 运营商 |
| platform | TEXT | 操作系统 (如 Android) |
| device_vendor | TEXT | 品牌 (如 Apple) |
| device_model | TEXT | 型号 (如 iPhone 14) |
| browser | TEXT | 浏览器名 |
| browser_ver | TEXT | 浏览器版本 |
| user_agent | TEXT | 原始 UA 字符串 |
| created_at | DATETIME | 访问时间 (默认当前) |

## 6. 部署方案
### 6.1 Windows 平台
- `scripts/install.bat`：自动执行 `npm install` 并下载必要的离线数据库文件。
- `scripts/start.bat`：启动 Node.js 服务并自动在默认浏览器打开管理后台。

### 6.2 Linux 平台 (当前系统)
- `scripts/install.sh`：一键安装依赖及数据库文件。
- `scripts/start.sh`：使用 `node` 或 `pm2` 启动服务。
- 支持标准的环境变量配置（如 `PORT`）。

## 7. 目录结构
```text
ip-recorder/
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   └── app.js
├── public/
│   ├── assets/ (CSS, Images)
│   ├── js/ (Modules)
│   └── libs/ (Local Vendors)
├── data/
│   ├── visits.db
│   └── ip2region.xdb
├── scripts/
│   ├── install.bat
│   └── start.bat
└── package.json
```
