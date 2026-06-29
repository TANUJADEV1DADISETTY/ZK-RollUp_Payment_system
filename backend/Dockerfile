FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build step if needed, or we just run ts-node via the scripts
EXPOSE 3001
