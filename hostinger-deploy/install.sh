#!/bin/bash 
echo "Installing TechAssist AI Beta..." 
npm install --production 
npm run build 
pm2 start ecosystem.config.js 
echo "✅ TechAssist AI Beta is now running!" 
