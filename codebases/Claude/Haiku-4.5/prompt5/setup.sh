#!/bin/bash

# 🚀 SecureMsg Project Setup & Launch Script
# This script helps you quickly set up and run the application

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║  SecureMsg - Educational Web Security Application     ║"
echo "║  Setup & Launch Script                                 ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if Node.js is installed
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please visit: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    echo "npm should come with Node.js"
    exit 1
fi

echo -e "${GREEN}✓ npm found: $(npm --version)${NC}"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cat > .env << EOF
PORT=3000
NODE_ENV=development
SESSION_SECRET=your_session_secret_change_this_in_production
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

# Show startup menu
echo ""
echo -e "${YELLOW}How would you like to run the application?${NC}"
echo ""
echo "1) Start normally (npm start)"
echo "2) Development mode with auto-reload (npm run dev)"
echo "3) Just show information and exit"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo -e "${GREEN}Starting application...${NC}"
        npm start
        ;;
    2)
        echo -e "${GREEN}Starting in development mode...${NC}"
        npm run dev
        ;;
    3)
        echo -e "${GREEN}Application setup complete!${NC}"
        echo ""
        echo "To start the application, run:"
        echo "  npm start              (normal mode)"
        echo "  npm run dev            (development mode with auto-reload)"
        echo ""
        echo "Documentation:"
        echo "  - QUICKSTART.md        (5-minute setup guide)"
        echo "  - README.md            (complete documentation)"
        echo "  - SECURITY.md          (security concepts explained)"
        echo "  - COURSEWORK.md        (course materials overview)"
        echo "  - ASSIGNMENT.md        (student assignment template)"
        echo ""
        echo "Open in browser: http://localhost:3000"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac
