# 📦 TechAssist AI - Dependencies Guide

This document outlines all dependencies required for the TechAssist AI project.

## Overview

TechAssist AI uses **two dependency systems**:
1. **Node.js** - Main application (required)
2. **Python** - Hardware store scraper (optional, but recommended)

---

## Node.js Dependencies

### Required Runtime
- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher (comes with Node.js)

### Dependency Files
- `package.json` - Dependency manifest
- `package-lock.json` - Locked dependency versions

### Installation
```bash
npm install
```

### Key Dependencies
- **React 18.3.1** - Frontend framework
- **Express 4.21.2** - Backend server
- **TypeScript 5.6.3** - Type safety
- **Drizzle ORM 0.39.1** - Database ORM
- **OpenAI SDK 4.97.0** - AI integration
- **Mapbox GL JS 3.11.1** - Maps
- **Vite 5.4.14** - Build tool

**Total**: ~880 npm packages (including transitive dependencies)

---

## Python Dependencies

### Required Runtime
- **Python**: 3.11 or higher
- **pip**: Comes with Python (or use `python3 -m pip`)

### Dependency Files
- `requirements.txt` - Python dependencies (standard format)
- `pyproject.toml` - Alternative Python project config (for uv/pip-tools)

### Installation
```bash
# Using pip
pip install -r requirements.txt

# Or using python3 -m pip
python3 -m pip install -r requirements.txt
```

### Dependencies
- **trafilatura>=2.0.0** - Web scraping and content extraction
  - Used for: Hardware store scraper (parts search feature)
- **twilio>=9.6.0** - SMS/communication (optional)
  - Used for: Future SMS notification features

### Why Python?
The hardware store scraper (`server/scrapers/hardware-store-scraper.py`) is written in Python because:
- Better web scraping libraries (trafilatura)
- Easier HTML parsing
- Called from Node.js via `child_process.execSync()`

---

## Startup Scripts

All startup scripts (`start-dev.bat`, `start-dev.ps1`, `start-dev.sh`) now handle:

1. ✅ **Node.js dependencies** - Automatically installs via `npm install`
2. ✅ **Python dependencies** - Automatically installs via `pip install -r requirements.txt` (if Python is available)
3. ✅ **Environment setup** - Creates `.env` file if missing
4. ✅ **Type checking** - Validates TypeScript (non-blocking)

### What Happens if Python is Missing?

**The app will still run!** Python dependencies are optional:
- ✅ Main application works
- ✅ All features work except parts search
- ⚠️ Parts search will use fallback mock data instead of real scraping

---

## Manual Installation

If you prefer to install manually:

### Node.js Dependencies
```bash
npm install
```

### Python Dependencies
```bash
# Check Python version
python3 --version  # Should be 3.11+

# Install dependencies
pip install -r requirements.txt
# OR
python3 -m pip install -r requirements.txt
```

---

## Updating Dependencies

### Node.js
```bash
# Update all packages
npm update

# Update specific package
npm update package-name

# Check for outdated packages
npm outdated
```

### Python
```bash
# Update all packages
pip install --upgrade -r requirements.txt

# Update specific package
pip install --upgrade trafilatura

# Check for outdated packages
pip list --outdated
```

---

## Dependency Files Summary

| File | Purpose | Required |
|------|---------|----------|
| `package.json` | Node.js dependencies | ✅ Yes |
| `package-lock.json` | Locked Node.js versions | ✅ Yes |
| `requirements.txt` | Python dependencies | ⚠️ Optional |
| `pyproject.toml` | Alternative Python config | ⚠️ Optional |

---

## Verification

### Check Node.js Installation
```bash
node --version  # Should be 18.0.0+
npm --version   # Should be 8.0.0+
```

### Check Python Installation
```bash
python3 --version  # Should be 3.11+
pip --version      # Or: python3 -m pip --version
```

### Verify Dependencies Installed
```bash
# Node.js
ls node_modules    # Should exist and have many folders

# Python
pip list           # Should show trafilatura and twilio
```

---

## Troubleshooting

### Node.js Issues
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Python Issues
```bash
# Reinstall Python packages
pip install --force-reinstall -r requirements.txt

# If permission errors (Mac/Linux)
pip install --user -r requirements.txt
```

### Port Conflicts
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill
```

---

## Production Deployment

### Node.js
- Use `npm ci` instead of `npm install` for production
- Only install production dependencies: `npm ci --only=production`

### Python
- Ensure Python 3.11+ is available on the server
- Install dependencies: `pip install -r requirements.txt`
- Consider using a virtual environment in production

---

## Summary

✅ **Node.js dependencies**: Required, automatically handled  
⚠️ **Python dependencies**: Optional, automatically handled if Python is available  
📝 **All dependency files**: Included in the repository  
🚀 **Startup scripts**: Handle everything automatically  

**You're all set!** Just run `start-dev.bat` (or `.ps1`/`.sh`) and everything will be installed automatically.

