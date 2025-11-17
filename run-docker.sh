#!/bin/bash

echo "🐳 Iris Arc Docker Deployment"
echo "=============================="
echo ""

# Check if user is in docker group
if ! groups | grep -q docker; then
    echo "⚠️  User not in docker group. Adding now..."
    echo "You'll need to enter your password:"
    sudo usermod -aG docker $USER
    echo ""
    echo "✅ Added to docker group!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Close this terminal"
    echo "2. Open a new terminal"
    echo "3. Run this script again: ./run-docker.sh"
    echo ""
    echo "Or run: newgrp docker && ./run-docker.sh"
    exit 0
fi

echo "✅ Docker group check passed"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    
    # Generate JWT secret
    JWT_SECRET=$(openssl rand -hex 32)
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    echo "✅ .env created with secure JWT_SECRET"
fi

echo "🏗️  Building and starting Docker containers..."
echo "This may take a few minutes on first run..."
echo ""

docker compose up --build

