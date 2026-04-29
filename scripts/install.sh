#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

cd "$(dirname "$0")/.." || exit 1

echo -e "${GREEN}=== IP Recorder - Install ===${NC}"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi

# 安装依赖
echo -e "${GREEN}[INFO] Installing dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] npm install failed.${NC}"
    exit 1
fi

# 创建 data 目录
if [ ! -d "data" ]; then
    echo -e "${YELLOW}[INFO] Creating data directory...${NC}"
    mkdir -p data
fi

# 下载 ip2region.xdb
XDB_PATH="data/ip2region.xdb"
XDB_URL="https://raw.githubusercontent.com/lionsoul2014/ip2region/master/data/ip2region.xdb"

if [ -f "$XDB_PATH" ]; then
    echo -e "${YELLOW}[INFO] ip2region.xdb already exists, skipping download.${NC}"
else
    echo -e "${GREEN}[INFO] Downloading ip2region.xdb...${NC}"
    curl -fL "$XDB_URL" -o "$XDB_PATH"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}[OK] ip2region.xdb downloaded.${NC}"
    else
        echo -e "${RED}[ERROR] Failed to download ip2region.xdb.${NC}"
        exit 1
    fi
fi

# 生成 .env
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}[INFO] Created .env from .env.example.${NC}"
    else
        cat > .env << 'EOF'
# Port to listen on, default 3000
PORT=3000

# Admin panel password (required)
ADMIN_PASSWORD=change_me_123

# Session secret key (use a random string)
SESSION_SECRET=please_change_this_secret
EOF
        echo -e "${YELLOW}[INFO] Generated default .env template.${NC}"
    fi
    echo -e "${YELLOW}[WARN] Please update ADMIN_PASSWORD and SESSION_SECRET in .env before starting.${NC}"
else
    echo -e "${YELLOW}[INFO] .env already exists, skipping.${NC}"
fi

echo ""
echo -e "${GREEN}[OK] Installation complete. Run scripts/start.sh to launch.${NC}"
