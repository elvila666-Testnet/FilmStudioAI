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
RUN pnpm install --no-frozen-lockfile || pnpm install || true

# Copy all source files
COPY . .

# Build client - this creates client/dist
RUN pnpm run build:client || echo "Client build skipped"

# Build server
RUN pnpm run build:server || echo "Server build skipped"

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Install pnpm and tsx
RUN npm install -g pnpm tsx

# Copy package.json
COPY package.json ./

# Install production dependencies
RUN pnpm install --prod --no-frozen-lockfile || pnpm install --prod || true

# Copy all files from builder (includes built client/dist)
COPY --from=builder /app . 

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start the application
CMD ["tsx", "server/_core/index.ts"]
