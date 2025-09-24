@echo off
cd /d "C:\Users\Sean Fitz\OneDrive\Desktop\TechAssistAI_Local\TechAssistAI"
echo Starting TechAssist AI server...
echo Working directory: %CD%
echo.
npx tsx index.ts
pause