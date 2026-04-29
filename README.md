# IP 记录器

一个基于 Node.js + Express 的访客 IP 记录系统，伪装为游戏官网，自动记录访客 IP、地理位置、设备信息，并提供后台管理界面。

## 功能特性

- 自动记录访客 IP 及地理位置（国家/省份/城市/ISP）
- WebRTC 获取真实 IP，检测代理/VPN
- 设备信息识别（操作系统、浏览器、设备型号）
- 后台数据面板（访问统计、地区分布、日志查询）
- 日期时间范围筛选
- 响应式布局，支持移动端
- 伪装为游戏官网首页

## 目录结构

```
├── server/
│   ├── app.js                    # 入口，路由注册
│   ├── controllers/
│   │   ├── visit.controller.js   # 访客记录、日志、统计
│   │   └── auth.controller.js    # 登录/登出
│   ├── middleware/
│   │   └── auth.middleware.js    # Session 登录验证
│   └── services/
│       ├── db.service.js         # SQLite 初始化
│       └── ip.service.js         # IP 地理查询
├── public/
│   ├── index.html                # 伪装首页
│   ├── admin/
│   │   ├── index.html            # 后台登录页
│   │   ├── dashboard.html        # 后台数据页
│   │   └── js/login.js
│   ├── js/
│   │   ├── app.js                # 后台前端逻辑
│   │   ├── webrtc.js             # WebRTC IP 获取
│   │   └── utils/api.js
│   └── assets/                   # 静态资源（图片/样式）
├── scripts/
│   ├── install.bat               # Windows 一键安装
│   ├── install.ps1               # Windows PowerShell 安装
│   ├── start.bat                 # Windows 启动
│   └── start.ps1                 # Windows PowerShell 启动
├── data/                         # 运行时数据（不含于仓库）
│   ├── visits.db                 # SQLite 数据库（自动创建）
│   └── ip2region.xdb             # IP 库文件（需手动下载）
├── .env.example                  # 环境变量模板
└── package.json
```

## 环境要求

| 环境 | 版本要求 |
|------|---------|
| Node.js | **>= 22.5.0**（内置 SQLite 支持，必须） |
| npm | >= 8.0.0 |

> Node.js 22.5.0 起内置 `node:sqlite` 模块，本项目依赖此特性，**不支持更低版本**。

---

## 安装与启动

### 准备 IP 库文件

运行前需下载 `ip2region.xdb` 并放入 `data/` 目录：

```bash
mkdir -p data
curl -L https://raw.githubusercontent.com/lionsoul2014/ip2region/master/data/ip2region.xdb -o data/ip2region.xdb
```

或手动从 [ip2region](https://github.com/lionsoul2014/ip2region) 下载后放入 `data/ip2region.xdb`。

---

### Linux

**1. 安装 Node.js 22+**

推荐使用 [nvm](https://github.com/nvm-sh/nvm)：

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
node -v  # 确认 >= v22.5.0
```

或使用 NodeSource 官方源（Debian/Ubuntu）：

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**2. 克隆项目**

```bash
git clone https://github.com/absyoyo/ip-recorder.git
cd ip-recorder
```

**3. 安装依赖**

```bash
npm install
```

**4. 配置环境变量**

```bash
cp .env.example .env
nano .env
```

修改以下内容：

```env
PORT=3000
ADMIN_PASSWORD=你的后台密码
SESSION_SECRET=随机字符串（建议32位以上）
```

**5. 下载 IP 库**

```bash
mkdir -p data
curl -L https://raw.githubusercontent.com/lionsoul2014/ip2region/master/data/ip2region.xdb -o data/ip2region.xdb
```

**6. 启动服务**

```bash
# 生产模式
npm start

# 开发模式（文件变更自动重启）
npm run dev
```

访问 `http://localhost:3000/` 查看前台，`http://localhost:3000/admin` 进入后台。

**后台运行（可选）**

```bash
# 使用 nohup
nohup npm start > app.log 2>&1 &

# 或使用 pm2
npm install -g pm2
pm2 start "npm start" --name ip-recorder
pm2 save
pm2 startup
```

---

### Windows

#### 方式一：一键脚本（推荐）

1. 安装 [Node.js 22+](https://nodejs.org/zh-cn/download)（选择 LTS 22.x，安装时勾选"Add to PATH"）

2. 克隆或下载项目后，双击运行：

```
scripts\install.bat
```

脚本会自动完成：安装依赖、下载 IP 库、生成 `.env` 配置文件。

3. 编辑 `.env` 修改密码：

```env
ADMIN_PASSWORD=你的后台密码
SESSION_SECRET=随机字符串
```

4. 双击启动：

```
scripts\start.bat
```

#### 方式二：PowerShell

以管理员身份打开 PowerShell：

```powershell
# 如遇执行策略限制，先运行：
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 安装
.\scripts\install.ps1

# 启动
.\scripts\start.ps1
```

#### 方式三：手动安装

```cmd
# 克隆项目
git clone https://github.com/absyoyo/ip-recorder.git
cd ip-recorder

# 安装依赖
npm install

# 创建 data 目录并下载 IP 库
mkdir data
powershell -Command "(New-Object Net.WebClient).DownloadFile('https://raw.githubusercontent.com/lionsoul2014/ip2region/master/data/ip2region.xdb', 'data\ip2region.xdb')"

# 复制配置文件
copy .env.example .env
# 用记事本编辑 .env，修改密码

# 启动
npm start
```

---

## 环境变量说明

| 变量 | 必填 | 说明 |
|------|------|------|
| `PORT` | 否 | 服务端口，默认 `3000` |
| `ADMIN_PASSWORD` | **是** | 后台登录密码 |
| `SESSION_SECRET` | 建议 | Session 签名密钥，建议设置为随机字符串 |

---

## API 接口

| 路由 | 方法 | 说明 |
|------|------|------|
| `/` | GET | 伪装首页 |
| `/v` | GET | 记录访客信息 |
| `/admin` | GET | 后台登录页 |
| `/admin/dashboard` | GET | 后台数据页（需登录） |
| `/api/login` | POST | 登录 |
| `/api/logout` | POST | 登出 |
| `/api/logs` | GET | 查询日志（需登录），参数：`page` `limit` `days` / `start` `end` |
| `/api/stats` | GET | 统计数据（需登录） |

---

## 常见问题

**Q: 启动报错 `ExperimentalWarning: SQLite is an experimental feature`**

正常现象，Node.js 22 内置 SQLite 仍标记为实验性，不影响使用。

**Q: 地理位置全部显示"未知"**

检查 `data/ip2region.xdb` 是否存在且完整（文件大小约 11MB）。

**Q: 本地访问 IP 显示 `127.0.0.1`**

本地环回地址无法查询地理信息，部署到公网服务器后正常。

**Q: Windows 下 PowerShell 脚本无法执行**

以管理员身份运行：`Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`

---

## License

MIT
