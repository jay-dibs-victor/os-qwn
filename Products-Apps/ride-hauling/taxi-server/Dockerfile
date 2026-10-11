# Backend Dockerfile
FROM node:18-bullseye-slim

# Install build dependencies for bcrypt if needed (though we use bcryptjs)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Increase memory limit for building
ENV NODE_OPTIONS=--max-old-space-size=4096

# Copy package files
COPY package*.json ./

# Config npm for better network resilience
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 5 && \
    npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Expose the backend port
EXPOSE 12000

# Start command
# Run the compiled code from dist for better performance and stability
CMD ["node", "dist/dynamic_server/server.js"]
