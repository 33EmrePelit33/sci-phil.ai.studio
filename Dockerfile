# Cloud Run / AI Studio production Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the Vite frontend for production
RUN npm run build

# Cloud Run sets PORT dynamically; default to 8080 if not set
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Start the server (must listen on $PORT and 0.0.0.0)
CMD ["npm", "start"]
