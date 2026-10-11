FROM node:18-bullseye-slim

WORKDIR /app

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

ENV NODE_OPTIONS=--max-old-space-size=4096

# Accept build-time API URL (override from docker-compose)
ARG VITE_API_URL=http://localhost:12000/api/v1
ENV VITE_API_URL=$VITE_API_URL

# Copy package files
COPY package*.json ./

# Config npm for better network resilience
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 5 && \
    npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Expose the frontend port
EXPOSE 4002

# Start the static server for the built frontend
CMD ["node", "server_react.cjs"]
