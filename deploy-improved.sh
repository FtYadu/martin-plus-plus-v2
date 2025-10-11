#!/bin/bash

# Martin++ v2 Improved - Deployment Script
# This script helps deploy the improved Martin++ application

set -e

echo "🚀 Martin++ v2 Improved - Deployment Script"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "README_IMPROVED.md" ]; then
    echo -e "${RED}Error: Please run this script from the martin-plus-plus-v2-master directory${NC}"
    exit 1
fi

# Function to print success message
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error message
error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print info message
info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Step 1: Check Node.js version
echo "Step 1: Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 20 ]; then
    success "Node.js version is compatible (v$(node -v))"
else
    error "Node.js version must be >= 20.9.0 (current: $(node -v))"
    exit 1
fi

# Step 2: Setup Backend
echo ""
echo "Step 2: Setting up Backend..."
cd backend

# Copy .env.production to .env if not exists
if [ ! -f ".env" ]; then
    if [ -f ".env.production" ]; then
        cp .env.production .env
        success "Copied .env.production to .env"
    else
        error ".env.production not found"
        exit 1
    fi
else
    info ".env already exists, skipping copy"
fi

# Install backend dependencies
if [ ! -d "node_modules" ]; then
    info "Installing backend dependencies..."
    npm install
    success "Backend dependencies installed"
else
    info "Backend dependencies already installed"
fi

# Build backend
info "Building backend..."
npm run build
success "Backend built successfully"

cd ..

# Step 3: Setup Frontend
echo ""
echo "Step 3: Setting up Frontend..."
cd frontend

# Install frontend dependencies
if [ ! -d "node_modules" ]; then
    info "Installing frontend dependencies..."
    npm install
    success "Frontend dependencies installed"
else
    info "Frontend dependencies already installed"
fi

# Build frontend
info "Building frontend..."
npm run build
success "Frontend built successfully"

cd ..

# Step 4: Summary
echo ""
echo "============================================"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "============================================"
echo ""
echo "To start the application:"
echo ""
echo "1. Start Backend (Terminal 1):"
echo "   cd backend && npm start"
echo "   Backend will run on: http://localhost:8080"
echo ""
echo "2. Start Frontend (Terminal 2):"
echo "   cd frontend && npm start"
echo "   Frontend will run on: http://localhost:3000"
echo ""
echo "3. Open your browser and visit:"
echo "   http://localhost:3000"
echo ""
echo "For production deployment:"
echo "  - Backend: Deploy to Heroku, Railway, or any Node.js hosting"
echo "  - Frontend: Deploy to Vercel, Cloudflare Pages, or Netlify"
echo ""
echo "Layercode Voice Agent:"
echo "  - API Key: eblluzi3fouhrwwri7c9tzoz"
echo "  - Webhook: /api/voice-agent"
echo "  - Configure at: https://dash.layercode.com"
echo ""
echo "For more details, see README_IMPROVED.md"
echo ""

