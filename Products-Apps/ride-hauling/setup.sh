#!/bin/bash
echo "🚀 Initializing AI-Powered Mobility Platform..."

# 1. Pull AI Models
echo "🤖 Pulling AI models (Llama3)..."
docker exec -it taxi-ollama ollama pull llama3 || echo "Warning: Could not pull model directly. Ensure ollama is running."

# 2. Build and Start Backend Services
echo "🏗️ Building and starting backend services..."
docker-compose up -d --build

# 3. Wait for Temporal and OS
echo "⏳ Waiting for AI OS and Temporal to stabilize..."
sleep 10

# 4. Final Verification
echo "✅ Platform is ready!"
echo "User App: http://localhost:4002"
echo "Driver App: http://localhost:4004"
echo "Temporal UI: http://localhost:8080"
