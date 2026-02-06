# Minimal Dockerfile - just serve files
FROM node:22-alpine

WORKDIR /app

# Install pnpm and tsx
RUN npm install -g pnpm tsx

# Copy package.json
COPY package.json ./

# Install production dependencies only
RUN pnpm install --prod --no-frozen-lockfile 2>/dev/null || pnpm install --prod 2>/dev/null || true

# Copy all source files (including any pre-built client/dist)
COPY . .

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start the application
CMD ["tsx", "server/_core/index.ts"]
