# 🚀 Quick Start Guide - TechAssist AI

Get your development environment up and running in seconds!

## Windows Users

### Option 1: Double-Click (Easiest)
1. **Double-click** `start-dev.bat`
2. The script will automatically:
   - Check Node.js installation
   - Create `.env` file if needed
   - Install dependencies if needed
   - Start the development server

### Option 2: PowerShell
1. **Right-click** `start-dev.ps1`
2. Select **"Run with PowerShell"**
3. If you get an execution policy error, run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

### Option 3: Command Line
```bash
# Using batch file
start-dev.bat

# Or using PowerShell
powershell -ExecutionPolicy Bypass -File start-dev.ps1

# Or manually
npm install
npm run dev
```

## Mac/Linux Users

Create a `start-dev.sh` file or use:

```bash
npm install
npm run dev
```

## What the Script Does

1. ✅ **Checks Node.js** - Verifies Node.js 18+ is installed
2. ✅ **Creates .env** - Sets up environment file if missing
3. ✅ **Installs Node.js Dependencies** - Runs `npm install` if needed
4. ✅ **Installs Python Dependencies** - Installs from `requirements.txt` if Python is available
5. ✅ **Type Check** - Validates TypeScript (non-blocking)
6. ✅ **Starts Server** - Launches development server on port 5000

## Dependencies

### Node.js Dependencies
- Managed by `package.json` and `package-lock.json`
- Automatically installed by the startup scripts

### Python Dependencies
- Managed by `requirements.txt`
- Required for: Hardware store scraper (parts search feature)
- Dependencies:
  - `trafilatura>=2.0.0` - Web scraping
  - `twilio>=9.6.0` - SMS/communication (optional)

**Note**: Python dependencies are optional. The app will run without them, but the parts search feature won't work.

## Access Your Application

Once the server starts:

- **Main App**: http://localhost:5000
- **Landing Page**: http://localhost:5000 (root)
- **Home Page**: http://localhost:5000/home
- **API Docs**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/api/health

## Environment Variables

The script creates a basic `.env` file. For full functionality, update it with:

```env
# Required
MAPBOX_ACCESS_TOKEN=your_mapbox_token_here

# Optional (app works with mock data if not provided)
OPENAI_API_KEY=your_openai_key_here
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
```

Get your tokens:
- **Mapbox**: https://account.mapbox.com/
- **OpenAI**: https://platform.openai.com/api-keys

## Troubleshooting

### Port 5000 Already in Use
```bash
# Windows - Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill
```

### Node.js Not Found
- Install Node.js 18+ from https://nodejs.org/
- Restart your terminal after installation

### Dependencies Won't Install
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Permission Errors (Mac/Linux)
```bash
chmod +x start-dev.sh
```

## Next Steps

1. ✅ Server running? Open http://localhost:5000
2. 📝 Update `.env` with your API keys for full features
3. 🎨 Start coding! The app uses hot-reload

## Development Tips

- **Hot Reload**: Changes auto-refresh in browser
- **TypeScript**: Run `npm run check` to see all type errors
- **Linting**: Run `npm run lint` to check code quality
- **Formatting**: Run `npm run format` to auto-format code

---

**Happy Coding! 🎉**

