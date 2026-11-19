# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

# Copy workspace manifests first for optimal layer caching
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY server/package*.json ./server/

# Install only server dependencies
RUN npm ci --ignore-scripts --workspace=server

# Copy source code for shared package and server
COPY shared/ ./shared/
COPY server/ ./server/

# Build the server
RUN npm run build --workspace=server


# Stage 2: Production
FROM node:24-alpine AS production

WORKDIR /app

# Copy root manifests and sub-package manifests
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY server/package*.json ./server/

# Install only production dependencies
RUN npm ci --omit=dev --ignore-scripts --workspace=server && npm cache clean --force

# Copy the shared package source (since it exports raw TypeScript)
COPY shared/ ./shared/

# Copy compiled JavaScript from builder stage
COPY --from=builder /app/server/dist ./server/dist

# Set working directory to the server application
WORKDIR /app/server

# Run as non-root user for security
USER node

# Expose the port your app runs on
EXPOSE 3000

# Start the server from the compiled production code
CMD ["node", "dist/index.js"]