#!/bin/bash

# Martin++ Startup Script

echo "🚀 Starting Martin++ Development Server..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "✅ Created .env file. Please update with your API keys."
    echo ""
fi

# Start Expo
echo "🎯 Starting Expo development server..."
echo ""
echo "Options:"
echo "  - Press 'a' to open on Android"
echo "  - Press 'w' to open on Web"
echo "  - Press 'r' to reload"
echo "  - Press 'c' to clear cache"
echo ""

npm start