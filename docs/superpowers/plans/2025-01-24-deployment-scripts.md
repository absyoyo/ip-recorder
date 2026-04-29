# IP Recorder Deployment and Asset Localization Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create cross-platform deployment scripts and ensure all static assets are localized.

**Architecture:** Use shell scripts for Linux/macOS and batch scripts for Windows to automate environment setup, dependency installation, directory creation, and data fetching.

**Tech Stack:** Bash, Batch/PowerShell, Node.js.

---

### Task 1: Create Linux Deployment Scripts

**Files:**
- Create: `scripts/install.sh`
- Create: `scripts/start.sh`

- [ ] **Step 1: Create `scripts/install.sh`**

```bash
#!/bin/bash

# Set colors for output
GREEN='\033[0-32m'
RED='\033[0-31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting installation for IP Recorder...${NC}"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed.${NC}"
    exit 1
fi

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
npm install --production

# Create data directory
if [ ! -d "data" ]; then
    echo -e "${GREEN}Creating data directory...${NC}"
    mkdir data
fi

# Download ip2region.xdb
XDB_URL="https://raw.githubusercontent.com/lionsoul2014/ip2region/master/data/ip2region.xdb"
echo -e "${GREEN}Downloading ip2region.xdb...${NC}"
curl -L $XDB_URL -o data/ip2region.xdb

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Installation successful!${NC}"
else
    echo -e "${RED}Error downloading ip2region.xdb.${NC}"
    exit 1
fi
```

- [ ] **Step 2: Create `scripts/start.sh`**

```bash
#!/bin/bash
echo "Starting IP Recorder server..."
node server/app.js
```

- [ ] **Step 3: Set execute permissions**

Run: `chmod +x scripts/install.sh scripts/start.sh`

- [ ] **Step 4: Commit Linux scripts**

```bash
git add scripts/install.sh scripts/start.sh
git commit -m "feat: add linux deployment scripts"
```

---

### Task 2: Create Windows Deployment Scripts

**Files:**
- Create: `scripts/install.bat`
- Create: `scripts/start.bat`

- [ ] **Step 1: Create `scripts/install.bat`**

```batch
@echo off
setlocal
echo Starting installation for IP Recorder...

:: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js is not installed.
    exit /b 1
)

:: Install dependencies
echo Installing dependencies...
call npm install --production

:: Create data directory
if not exist "data" (
    echo Creating data directory...
    mkdir data
)

:: Download ip2region.xdb using PowerShell
set XDB_URL=https://raw.githubusercontent.com/lionsoul2014/ip2region/master/data/ip2region.xdb
echo Downloading ip2region.xdb...
powershell -Command "Invoke-WebRequest -Uri '%XDB_URL%' -OutFile 'data\ip2region.xdb'"

if %ERRORLEVEL% equ 0 (
    echo Installation successful!
) else (
    echo Error downloading ip2region.xdb.
    exit /b 1
)
endlocal
```

- [ ] **Step 2: Create `scripts/start.bat`**

```batch
@echo off
echo Starting IP Recorder server...
node server/app.js
pause
```

- [ ] **Step 3: Commit Windows scripts**

```bash
git add scripts/install.bat scripts/start.bat
git commit -m "feat: add windows deployment scripts"
```

---

### Task 3: Asset Localization and Final Check

**Files:**
- Modify: `public/index.html` (if needed)
- Create: `public/libs/.gitkeep`

- [ ] **Step 1: Verify `public/libs` exists**

Run: `mkdir -p public/libs && touch public/libs/.gitkeep`

- [ ] **Step 2: Review `public/index.html` for external resources**
Current check shows all assets are internal or inline. No action needed unless new assets were planned.

- [ ] **Step 3: Final validation of installation logic**
Run `scripts/install.sh` (if in Linux) and check if `data/ip2region.xdb` is present.

- [ ] **Step 4: Commit all changes**

```bash
git add .
git commit -m "feat: cross-platform deployment scripts and asset localization"
```
