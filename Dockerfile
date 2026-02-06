# Build stage - compile TypeScript
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Install pnpm
RUN npm install -g pnpm

# Copy package.json
COPY package.json ./

# Install all dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build server (compile TypeScript to JavaScript)
RUN pnpm run build:server || echo "Build script not found, will use tsx at runtime"

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Install pnpm and tsx for runtime TypeScript execution
RUN npm install -g pnpm tsx

# Copy package.json
COPY package.json ./

# Install production dependencies only
RUN pnpm install --prod

# Copy all source files
COPY . .

# Copy built files from builder if they exist
COPY --from=builder /app/dist ./dist 2>/dev/null || true

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start the application using tsx to run TypeScript directly
CMD ["tsx", "server/_core/index.ts"]
