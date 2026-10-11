#!/bin/bash
# pull-and-build.sh
# Retries pulling base images until Docker Hub is reachable, then builds.

set -e

IMAGES=("node:18-alpine" "mongo:latest")
MAX_RETRIES=10
WAIT_SECONDS=15

echo "🐳 Checking Docker Hub connectivity..."

for IMAGE in "${IMAGES[@]}"; do
  ATTEMPT=1
  while [ $ATTEMPT -le $MAX_RETRIES ]; do
    echo "  Pulling $IMAGE (attempt $ATTEMPT/$MAX_RETRIES)..."
    if docker pull "$IMAGE"; then
      echo "  ✅ $IMAGE pulled successfully."
      break
    fi
    if [ $ATTEMPT -eq $MAX_RETRIES ]; then
      echo "  ❌ Failed to pull $IMAGE after $MAX_RETRIES attempts."
      echo "     Try adding a registry mirror in Docker Desktop → Settings → Docker Engine."
      exit 1
    fi
    echo "  ⏳ Retrying in ${WAIT_SECONDS}s..."
    sleep $WAIT_SECONDS
    ATTEMPT=$((ATTEMPT + 1))
  done
done

echo ""
echo "🚀 All base images ready. Starting docker-compose build..."
docker-compose up --build
