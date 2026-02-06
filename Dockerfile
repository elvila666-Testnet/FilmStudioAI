# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Install pnpm
RUN npm install -g pnpm

# Copy package.json
COPY package.json ./

# Install all dependencies
RUN pnpm install --no-frozen-lockfile 2>/dev/null || pnpm install

# Copy all source files
COPY . .

# Try to build client (optional, may fail if not configured)
RUN pnpm run build:client 2>/dev/null || echo "Client build skipped"

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Install pnpm and tsx
RUN npm install -g pnpm tsx

# Copy package.json
COPY package.json ./

# Install production dependencies
RUN pnpm install --prod --no-frozen-lockfile 2>/dev/null || pnpm install --prod

# Copy all files from builder
COPY --from=builder /app . 

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start the application using tsx to run TypeScript
CMD ["tsx", "server/_core/index.ts"]
