#!/bin/bash

# BibleMap Docker startup script
set -e

echo "🚀 Starting BibleMap with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    echo ""
    echo "On macOS: Open Docker Desktop application"
    echo "On Linux: sudo systemctl start docker"
    echo ""
    exit 1
fi

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your settings."
fi

# Build containers
echo "🔨 Building Docker containers..."
docker-compose build

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service status..."
docker-compose ps

echo ""
echo "✅ BibleMap is running!"
echo ""
echo "🌐 Access the services:"
echo "  📍 Frontend: http://localhost:3001"
echo "  📍 Backend API: http://localhost:4000"
echo "  📍 pgAdmin: http://localhost:5050"
echo "     Email: admin@biblemap.com"
echo "     Password: admin123"
echo ""
echo "📝 Useful commands:"
echo "  make logs     - View logs"
echo "  make stop     - Stop services"
echo "  make clean    - Remove everything"
echo ""