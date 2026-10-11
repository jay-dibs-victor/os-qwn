FROM node:18-bullseye-slim

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_OPTIONS=--max-old-space-size=4096

# 1. Install root dependencies (ts-node, typescript, tsconfig-paths, shared utils)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# 2. Install operating-system service-specific dependencies
#    These are copied BEFORE the full source so Docker can cache this layer
COPY server/operating-system/package*.json ./server/operating-system/
RUN cd server/operating-system && npm install --legacy-peer-deps

# 3. Copy full source (node_modules excluded via .dockerignore)
COPY . .

EXPOSE 12010

CMD ["npm", "run", "start:ai-os"]
