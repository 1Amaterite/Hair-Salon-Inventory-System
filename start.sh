#!/bin/bash

# Hair Salon Inventory System - Startup Script
# This script starts both backend and frontend servers

echo "🚀 Starting Hair Salon Inventory System..."

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit
}

# Set up signal handlers for cleanup
trap cleanup SIGINT SIGTERM

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "🔥 Starting servers..."

# Start backend server
echo "🖥️  Starting backend server on http://localhost:3000"
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🌐 Starting frontend server on http://localhost:5173"
cd frontend && npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

echo ""
echo "✅ Both servers are running!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:3000"
echo ""
echo "👤 Test Credentials:"
echo "   Admin:  username=admin, password=admin123"
echo "   Staff:  username=staff, password=staff123"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop the script
wait
