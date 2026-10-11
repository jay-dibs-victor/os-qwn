#!/bin/bash

# ============================================================================
# QUICK REBUILD COMMANDS - Database Seeder Complete
# ============================================================================
# Run this script to rebuild the database with fresh seeding
# ============================================================================

echo "🚀 Starting fresh rebuild with database seeding..."
echo ""

# Step 1: Navigate to backend directory
echo "📁 Moving to backend directory..."
cd core-service-backend-crm || exit 1

# Step 2: Delete old database (IMPORTANT - deletes volumes)
echo "🗑️  Deleting old database and volumes..."
docker compose down -v

# Step 3: Rebuild and start services with fresh seeding
echo "🔨 Building and starting services with fresh database..."
docker compose up --build -d

# Step 4: Wait for services to be ready
echo "⏳ Waiting for services to start (30 seconds)..."
sleep 30

# Step 5: Show logs from auth service
echo ""
echo "📋 Auth Service Logs (showing seeding process):"
echo "============================================================================"
docker compose logs -f auth-service &
LOGS_PID=$!

# Wait for seeding to complete
echo ""
echo "⏳ Waiting for seeding to complete..."
sleep 15

# Kill the logs process
kill $LOGS_PID 2>/dev/null

echo ""
echo "✅ Seeding should be complete!"
echo ""
echo "============================================================================"
echo "NEXT STEPS - Test the login:"
echo "============================================================================"
echo ""
echo "Test Root Admin Login:"
echo "curl -X POST http://localhost:3000/auth/login \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"email\":\"admin@queensos.com\",\"password\":\"Admin@123456\",\"tenantId\":\"root-admin\"}'"
echo ""
echo "Test Tenant Admin Login:"
echo "curl -X POST http://localhost:3000/auth/login \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"email\":\"admin@tenant-001.com\",\"password\":\"Admin@123456\",\"tenantId\":\"tenant-001\"}'"
echo ""
echo "Expected Response: 200 OK with access_token (NOT 401 Unauthorized)"
echo ""
echo "============================================================================"
echo "FRONTEND TEST:"
echo "============================================================================"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Test Sign-Up with phone input (should auto-detect country)"
echo "3. Test Login with credentials above"
echo "4. Verify Google OAuth button appears on Sign-Up Step 1"
echo ""
echo "============================================================================"
echo "Done! 🎉"
echo "============================================================================"
