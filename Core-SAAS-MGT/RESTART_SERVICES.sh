#!/bin/bash

# Script to restart services after applying fixes
# Run this script from the Core-SAAS-MGT directory

echo "🔄 Restarting Backend Services..."
cd core-service-backend-crm

echo "📦 Building backend..."
npm run build

echo "🛑 Stopping Docker containers..."
docker compose down

echo "🚀 Starting Docker containers..."
docker compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

echo "✅ Checking services status..."
docker compose ps

echo ""
echo "🌐 Testing API Gateway..."
curl -s http://localhost:3000/auth

echo ""
echo ""
echo "✅ Backend services restarted!"
echo ""
echo "📝 Next steps:"
echo "1. Go to customer-relation-management directory"
echo "2. Stop the dev server if running (Ctrl+C)"
echo "3. Run: npm run dev"
echo "4. Open http://localhost:5173/login in your browser"
echo "5. Clear browser cache or use incognito mode"
echo ""
echo "Happy testing! 🎉"
