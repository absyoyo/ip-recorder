#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

cd "$(dirname "$0")/.." || exit 1

echo -e "${GREEN}=== IP Recorder ===${NC}"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[INFO] node_modules not found. Installing dependencies...${NC}"
    npm install
fi

# 检查 data 目录
if [ ! -d "data" ]; then
    echo -e "${YELLOW}[INFO] Creating data directory...${NC}"
    mkdir -p data
fi

# 检查 ip2region.xdb
if [ ! -f "data/ip2region.xdb" ]; then
    echo -e "${YELLOW}[WARN] data/ip2region.xdb not found. Geo info will return unknown.${NC}"
    echo -e "${YELLOW}[WARN] Run scripts/install.sh to download it.${NC}"
fi

# 检查 .env
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}[INFO] .env not found. Generating...${NC}"
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
    echo -e "${RED}[ERROR] Please set ADMIN_PASSWORD and SESSION_SECRET in .env, then restart.${NC}"
    exit 1
fi

# 检查 ADMIN_PASSWORD 是否为默认值
ADMIN_PWD=$(grep -E '^ADMIN_PASSWORD=' .env | cut -d= -f2)
if [ "$ADMIN_PWD" = "change_me_123" ] || [ -z "$ADMIN_PWD" ]; then
    echo -e "${RED}[ERROR] ADMIN_PASSWORD is not set or still default. Please update .env.${NC}"
    exit 1
fi

# 读取 PORT
PORT=$(grep -E '^PORT=' .env | cut -d= -f2)
PORT=${PORT:-3000}

echo -e "${GREEN}[OK] All checks passed. Starting server...${NC}"
echo -e "${GREEN}[OK] Homepage : http://localhost:${PORT}/${NC}"
echo -e "${GREEN}[OK] Admin    : http://localhost:${PORT}/admin${NC}"
echo ""

node --experimental-sqlite server/app.js
