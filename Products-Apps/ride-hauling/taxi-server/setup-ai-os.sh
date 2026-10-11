#!/bin/bash

# --- AI Operating System Setup Script ---
# This script builds the platform, starts the containers, and pulls the LLM model.

echo "🚀 Starting AI Operating System Setup..."

# 1. Build and Start Containers
echo "📦 Building and starting containers from root (this may take a few minutes)..."
docker-compose -f ../docker-compose.yml up --build -d

if [ $? -ne 0 ]; then
    echo "❌ Error: Docker Compose failed to start."
    exit 1
fi

# 2. Wait for Ollama to be ready
echo "⏳ Waiting for Ollama to initialize..."
MAX_RETRIES=10
COUNT=0
OLLAMA_CONTAINER="taxi-ollama"

while [ $COUNT -lt $MAX_RETRIES ]; do
    docker exec $OLLAMA_CONTAINER ollama list > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Ollama is ready."
        break
    fi
    echo "...still waiting ($((COUNT+1))/$MAX_RETRIES)"
    sleep 5
    COUNT=$((COUNT+1))
done

if [ $COUNT -eq $MAX_RETRIES ]; then
    echo "⚠️ Warning: Ollama took too long to start. You might need to run 'docker exec -it $OLLAMA_CONTAINER ollama pull llama3' manually later."
else
    # 3. Pull the model
    echo "🧠 Pulling Llama3 model into the OS brain..."
    docker exec $OLLAMA_CONTAINER ollama pull llama3
fi

echo ""
echo "✨ --- SETUP COMPLETE --- ✨"
echo "🌐 API Gateway:  http://localhost:12000"
echo "🕰️ Temporal UI:   http://localhost:8080"
echo "🎙️ LiveKit:      http://localhost:7880"
echo "📱 User App:     http://localhost:4002"
echo ""
echo "To view AI OS logs: docker-compose logs -f ai-os"
echo "-------------------------------------------"
