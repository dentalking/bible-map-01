#!/bin/bash

# Backend deployment script for Railway
echo "🚀 Deploying Backend to Railway..."

cd biblemap/backend

# Set service and deploy
railway service bible-map-01-backend
railway variables --set RAILWAY_ROOT_DIRECTORY=biblemap/backend
railway up --detach

echo "✅ Backend deployment initiated!"
echo "📋 Check build logs at: https://railway.app/project/9ace7c80-6892-4e42-900a-ae9fea2fa3ec"