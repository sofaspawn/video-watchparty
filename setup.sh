#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎬 Video Watchparty Setup${NC}\n"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm is not installed. Installing globally..."
    npm install -g pnpm
fi

echo -e "${GREEN}✓ Dependencies check passed${NC}\n"

# Install server dependencies
echo -e "${BLUE}Installing server dependencies...${NC}"
cd server
pnpm install
cd ..

# Install client dependencies
echo -e "${BLUE}Installing client dependencies...${NC}"
cd client
pnpm install
cd ..

echo -e "\n${GREEN}✓ Installation complete!${NC}\n"

echo -e "${BLUE}To start the watchparty:${NC}"
echo -e "1. ${GREEN}Terminal 1 (Server)${NC}: cd server && pnpm start"
echo -e "2. ${GREEN}Terminal 2 (Client)${NC}: cd client && pnpm run dev"
echo -e "\n3. Open ${GREEN}http://localhost:5173${NC} in two browser windows\n"
