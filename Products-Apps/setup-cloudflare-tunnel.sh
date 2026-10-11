#!/bin/bash

# Cloudflare Tunnel Setup Script for Queens OS API
# This script sets up a Cloudflare Tunnel to expose the API gateway

echo "🚀 Setting up Cloudflare Tunnel for Queens OS API..."

# Step 1: Install cloudflared (if not already installed)
if ! command -v cloudflared &> /dev/null; then
    echo "📦 Installing cloudflared..."
    
    # Download for macOS
    curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz -o /tmp/cloudflared.tgz
    tar -xzf /tmp/cloudflared.tgz -C /tmp
    sudo mv /tmp/cloudflared /usr/local/bin/
    sudo chmod +x /usr/local/bin/cloudflared
    
    echo "✅ cloudflared installed"
else
    echo "✅ cloudflared already installed"
fi

# Step 2: Start quick tunnel (no login required)
echo ""
echo "🌐 Starting Cloudflare Quick Tunnel..."
echo "This will generate a temporary HTTPS URL that works for 24 hours"
echo ""

# Start tunnel in background and capture URL
cloudflared tunnel --url http://localhost:12000 > /tmp/cloudflare-tunnel.log 2>&1 &
TUNNEL_PID=$!

echo "⏳ Waiting for tunnel to start..."
sleep 5

# Extract the URL from logs
TUNNEL_URL=$(grep -o 'https://[^[:space:]]*\.trycloudflare\.com' /tmp/cloudflare-tunnel.log | head -1)

if [ -z "$TUNNEL_URL" ]; then
    echo "❌ Failed to get tunnel URL. Check logs:"
    cat /tmp/cloudflare-tunnel.log
    exit 1
fi

echo ""
echo "✅ Cloudflare Tunnel is running!"
echo "📡 Public URL: $TUNNEL_URL"
echo "🔗 API Base URL: $TUNNEL_URL/api/v1"
echo ""

# Step 3: Update mobile app .env.local files
echo "📝 Updating mobile app configuration..."

echo "EXPO_PUBLIC_API_URL=$TUNNEL_URL/api/v1" > mobile-user/.env.local
echo "EXPO_PUBLIC_API_URL=$TUNNEL_URL/api/v1" > mobile-driver/.env.local

echo "✅ Mobile apps configured"
echo ""

# Step 4: Show next steps
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Next Steps:"
echo "1. Restart your Expo app:"
echo "   cd mobile-user && npx expo start --clear"
echo ""
echo "2. Scan the QR code on your phone"
echo ""
echo "3. Try logging in with:"
echo "   Email: demouser@gmail.com"
echo "   Password: secret"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔧 Tunnel Info:"
echo "   URL: $TUNNEL_URL"
echo "   PID: $TUNNEL_PID"
echo "   Logs: /tmp/cloudflare-tunnel.log"
echo ""
echo "To stop the tunnel: kill $TUNNEL_PID"
echo ""
