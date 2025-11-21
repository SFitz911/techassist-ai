# TechAssist AI - Development Server Launcher (PowerShell)
# This script sets up and starts the development server

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TechAssist AI - Development Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "[1/5] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "        Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Check if .env file exists
Write-Host "[2/5] Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "        .env file not found. Creating..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "        Created .env file from .env.example" -ForegroundColor Green
    } else {
        $envContent = @"
# TechAssist AI Environment Variables
MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbGV4YW1wbGUifQ.example
OPENAI_API_KEY=
DATABASE_URL=
SESSION_SECRET=dev-session-secret-change-in-production
NODE_ENV=development
PORT=5000
"@
        Set-Content -Path ".env" -Value $envContent
        Write-Host "        Created basic .env file" -ForegroundColor Green
    }
    Write-Host "        WARNING: Please update .env with your API keys!" -ForegroundColor Yellow
} else {
    Write-Host "        .env file found" -ForegroundColor Green
}
Write-Host ""

# Check if node_modules exists
Write-Host "[3/6] Checking Node.js dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "        Dependencies not installed. Installing..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "        Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "        Dependencies found" -ForegroundColor Green
}
Write-Host ""

# Check Python dependencies
Write-Host "[4/6] Checking Python dependencies..." -ForegroundColor Yellow
try {
    $pythonVersion = python3 --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "        Python found: $pythonVersion" -ForegroundColor Green
        try {
            $pipVersion = python3 -m pip --version 2>&1
            if ($LASTEXITCODE -eq 0) {
                if (Test-Path "requirements.txt") {
                    Write-Host "        Installing Python dependencies..." -ForegroundColor Yellow
                    python3 -m pip install -q -r requirements.txt
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "        Python dependencies installed" -ForegroundColor Green
                    } else {
                        Write-Host "        Warning: Failed to install Python dependencies" -ForegroundColor Yellow
                        Write-Host "        The app will work but parts search may not function" -ForegroundColor Yellow
                    }
                } else {
                    Write-Host "        requirements.txt not found (optional)" -ForegroundColor Yellow
                }
            } else {
                Write-Host "        pip not found (Python dependencies optional)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "        pip not available (Python dependencies optional)" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "        Python not found (Python dependencies optional)" -ForegroundColor Yellow
    Write-Host "        Note: Parts search feature requires Python 3.11+" -ForegroundColor Yellow
}
Write-Host ""

# Check for TypeScript errors (non-blocking)
Write-Host "[5/6] Running type check..." -ForegroundColor Yellow
$typeCheck = npm run check 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "        Type check passed" -ForegroundColor Green
} else {
    Write-Host "        Type check found issues (non-blocking for development)" -ForegroundColor Yellow
}
Write-Host ""

# Start the development server
Write-Host "[6/6] Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Server starting..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Local:    http://localhost:5000" -ForegroundColor Green
Write-Host "  API Docs: http://localhost:5000/api-docs" -ForegroundColor Green
Write-Host ""
Write-Host "  Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

npm run dev

