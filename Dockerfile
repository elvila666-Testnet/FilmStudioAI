# Simple Dockerfile that copies everything
FROM node:22-alpine

WORKDIR /app

# Install pnpm and tsx
RUN npm install -g pnpm tsx

# Copy package.json
COPY package.json ./

# Install production dependencies
RUN pnpm install --prod --no-frozen-lockfile 2>/dev/null || true

# Copy all source files
COPY . .

# Make sure client/dist exists and has index.html
RUN mkdir -p client/dist && \
    if [ ! -f client/dist/index.html ]; then \
      echo '<!DOCTYPE html><html><head><title>AI Film Studio</title></head><body><h1>AI Film Studio</h1><p>Loading...</p></body></html>' > client/dist/index.html; \
    fi

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start the application
CMD ["tsx", "server/_core/index.ts"]
