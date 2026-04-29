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
