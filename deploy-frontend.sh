#!/bin/bash

# Frontend deployment script for Railway
echo "🚀 Deploying Frontend to Railway..."

cd biblemap/frontend

# Set service and deploy
railway service bible-map-01
railway variables --set RAILWAY_ROOT_DIRECTORY=biblemap/frontend
railway up --detach

echo "✅ Frontend deployment initiated!"
echo "📋 Check build logs at: https://railway.app/project/9ace7c80-6892-4e42-900a-ae9fea2fa3ec"