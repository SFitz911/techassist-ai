@echo off
REM TechAssist AI - Development Server Launcher
REM This script sets up and starts the development server

echo.
echo ========================================
echo   TechAssist AI - Development Server
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

REM Check Node.js version
echo [1/5] Checking Node.js version...
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo        Node.js version: %NODE_VERSION%
echo.

REM Check if .env file exists
echo [2/5] Checking environment configuration...
if not exist .env (
    echo        .env file not found. Creating from template...
    if exist .env.example (
        copy .env.example .env >nul
        echo        Created .env file from .env.example
        echo        WARNING: Please update .env with your API keys!
    ) else (
        echo        Creating basic .env file...
        (
            echo # TechAssist AI Environment Variables
            echo MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbGV4YW1wbGUifQ.example
            echo OPENAI_API_KEY=
            echo DATABASE_URL=
            echo SESSION_SECRET=dev-session-secret-change-in-production
            echo NODE_ENV=development
            echo PORT=5000
        ) > .env
        echo        Created basic .env file
        echo        WARNING: Please update .env with your API keys!
    )
) else (
    echo        .env file found
)
echo.

REM Check if node_modules exists
echo [3/6] Checking Node.js dependencies...
if not exist node_modules (
    echo        Dependencies not installed. Installing...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo        Dependencies installed successfully
) else (
    echo        Dependencies found
)
echo.

REM Check Python dependencies
echo [4/6] Checking Python dependencies...
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    where python3 >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo        Python found. Checking pip...
        python3 -m pip --version >nul 2>&1
        if %ERRORLEVEL% EQU 0 (
            if exist requirements.txt (
                echo        Installing Python dependencies...
                python3 -m pip install -q -r requirements.txt
                if %ERRORLEVEL% EQU 0 (
                    echo        Python dependencies installed
                ) else (
                    echo        Warning: Failed to install Python dependencies
                    echo        The app will work but parts search may not function
                )
            ) else (
                echo        requirements.txt not found (optional)
            )
        ) else (
            echo        pip not found (Python dependencies optional)
        )
    ) else (
        echo        Python 3 not found (Python dependencies optional)
    )
) else (
    echo        Python not found (Python dependencies optional)
    echo        Note: Parts search feature requires Python 3.11+
)
echo.

REM Check for TypeScript errors (non-blocking)
echo [5/6] Running type check...
call npm run check >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo        Type check passed
) else (
    echo        Type check found issues (non-blocking for development)
)
echo.

REM Start the development server
echo [6/6] Starting development server...
echo.
echo ========================================
echo   Server starting...
echo ========================================
echo.
echo   Local:    http://localhost:5000
echo   API Docs: http://localhost:5000/api-docs
echo.
echo   Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

call npm run dev

