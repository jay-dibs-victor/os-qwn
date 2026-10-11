FROM node:18-bullseye-slim

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 12006

CMD ["npm", "start"]
