#!/bin/bash
# TechAssist AI - Development Server Launcher (Mac/Linux)
# This script sets up and starts the development server

echo ""
echo "========================================"
echo "  TechAssist AI - Development Server"
echo "========================================"
echo ""

# Check if Node.js is installed
echo "[1/5] Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed or not in PATH"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node --version)
echo "        Node.js version: $NODE_VERSION"
echo ""

# Check if .env file exists
echo "[2/5] Checking environment configuration..."
if [ ! -f .env ]; then
    echo "        .env file not found. Creating..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "        Created .env file from .env.example"
    else
        cat > .env << EOF
# TechAssist AI Environment Variables
MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbGV4YW1wbGUifQ.example
OPENAI_API_KEY=
DATABASE_URL=
SESSION_SECRET=dev-session-secret-change-in-production
NODE_ENV=development
PORT=5000
EOF
        echo "        Created basic .env file"
    fi
    echo "        WARNING: Please update .env with your API keys!"
else
    echo "        .env file found"
fi
echo ""

# Check if node_modules exists
echo "[3/6] Checking Node.js dependencies..."
if [ ! -d "node_modules" ]; then
    echo "        Dependencies not installed. Installing..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to install dependencies"
        exit 1
    fi
    echo "        Dependencies installed successfully"
else
    echo "        Dependencies found"
fi
echo ""

# Check Python dependencies
echo "[4/6] Checking Python dependencies..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "        Python found: $PYTHON_VERSION"
    if command -v pip3 &> /dev/null || python3 -m pip --version &> /dev/null; then
        if [ -f "requirements.txt" ]; then
            echo "        Installing Python dependencies..."
            python3 -m pip install -q -r requirements.txt
            if [ $? -eq 0 ]; then
                echo "        Python dependencies installed"
            else
                echo "        Warning: Failed to install Python dependencies"
                echo "        The app will work but parts search may not function"
            fi
        else
            echo "        requirements.txt not found (optional)"
        fi
    else
        echo "        pip not found (Python dependencies optional)"
    fi
else
    echo "        Python not found (Python dependencies optional)"
    echo "        Note: Parts search feature requires Python 3.11+"
fi
echo ""

# Check for TypeScript errors (non-blocking)
echo "[5/6] Running type check..."
npm run check > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "        Type check passed"
else
    echo "        Type check found issues (non-blocking for development)"
fi
echo ""

# Start the development server
echo "[6/6] Starting development server..."
echo ""
echo "========================================"
echo "  Server starting..."
echo "========================================"
echo ""
echo "  Local:    http://localhost:5000"
echo "  API Docs: http://localhost:5000/api-docs"
echo ""
echo "  Press Ctrl+C to stop the server"
echo ""
echo "========================================"
echo ""

npm run dev

