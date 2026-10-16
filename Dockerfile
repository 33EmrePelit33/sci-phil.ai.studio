FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci || npm install

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Ensure tsx is available at runtime
RUN npm install tsx --save-prod || npm install tsx

CMD ["npx", "tsx", "server.ts"]
