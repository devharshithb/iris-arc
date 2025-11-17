#!/bin/bash
echo "🐳 Starting Iris Arc with Docker..."
echo ""
sg docker -c "docker compose up --build"
