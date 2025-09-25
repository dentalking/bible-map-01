#!/bin/bash

# Local development script for BibleMap
# Run services without Docker

echo "🚀 Starting BibleMap in local development mode..."

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "⚠️  PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "⚠️  Redis is not running. Please start Redis first."
    exit 1
fi

# Function to run in new terminal tab (macOS)
run_in_new_tab() {
    osascript -e "
    tell application \"Terminal\"
        do script \"cd $(pwd) && $1\"
    end tell"
}

# Start backend
echo "📦 Starting backend..."
run_in_new_tab "cd backend && npm run dev"

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend..."
run_in_new_tab "cd frontend && npm run dev"

echo "✅ All services starting..."
echo ""
echo "📍 Frontend: http://localhost:3001"
echo "📍 Backend:  http://localhost:4000"
echo ""
echo "Press Ctrl+C to stop watching this script"

# Keep script running
while true; do
    sleep 1
done