# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Install pnpm
RUN npm install -g pnpm

# Copy package.json
COPY package.json ./

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy all source
COPY . .

# Build both client and server
RUN pnpm run build

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Install pnpm and tsx
RUN npm install -g pnpm tsx

# Copy package.json
COPY package.json ./

# Install production dependencies only
RUN pnpm install --prod --no-frozen-lockfile

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server ./server

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Start the application
CMD ["tsx", "server/_core/index.ts"]
