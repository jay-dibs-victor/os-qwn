#!/bin/bash

echo "🔨 Rebuilding and Restarting Services..."
echo ""

cd core-service-backend-crm

echo "1️⃣ Building backend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "2️⃣ Stopping all containers..."
docker compose down

echo ""
echo "3️⃣ Rebuilding Docker images..."
docker compose build auth-service api-gateway

echo ""
echo "4️⃣ Starting infrastructure services..."
docker compose up -d postgres redis rabbitmq

echo ""
echo "⏳ Waiting for infrastructure to be ready (15 seconds)..."
sleep 15

echo ""
echo "5️⃣ Starting auth-service and api-gateway..."
docker compose up -d auth-service api-gateway

echo ""
echo "⏳ Waiting for services to start (10 seconds)..."
sleep 10

echo ""
echo "6️⃣ Checking service status..."
docker compose ps

echo ""
echo "7️⃣ Checking auth service logs for seeding..."
docker compose logs auth-service | grep -A 30 "seeding" || echo "No seeding logs yet, service may still be starting..."

echo ""
echo "8️⃣ Testing API Gateway..."
curl -s http://localhost:3000/auth || echo "API Gateway not responding yet"

echo ""
echo ""
echo "✅ Services restarted!"
echo ""
echo "📝 Seeded Credentials:"
echo "  Root Admin: admin@queensos.com / Admin@123456 (tenant: root-admin)"
echo "  Demo User: user@tenant-001.com / User@123456 (tenant: tenant-001)"
echo "  Demo Admin: admin@tenant-001.com / Admin@123456 (tenant: tenant-001)"
echo ""
echo "🌐 Next steps:"
echo "  1. Make sure frontend dev server is running: cd customer-relation-management && npm run dev"
echo "  2. Open http://localhost:5173/login"
echo "  3. Try registering with tenant-001"
echo ""
echo "🔍 To check logs:"
echo "  docker compose logs -f auth-service"
echo "  docker compose logs -f api-gateway"
