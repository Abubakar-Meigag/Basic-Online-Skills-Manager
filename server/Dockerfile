# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

# Copy workspace manifests first for optimal layer caching
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY server/package*.json ./server/

# Install dependencies across the workspace
RUN npm ci --ignore-scripts

# Copy source code for shared package and server
COPY shared/ ./shared/
COPY server/ ./server/

# Build shared first (server imports its compiled output), then the server
RUN npm run build --workspace=shared && npm run build --workspace=server


# Stage 2: Production
FROM node:24-alpine AS production

WORKDIR /app

# Used for setting the server time zone to UTC
ENV TZ=UTC 

# Copy root manifests and sub-package manifests
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY server/package*.json ./server/

# Install only production dependencies
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copy compiled JavaScript from builder stage (shared and server)
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/server/dist ./server/dist

# Set working directory to the server application
WORKDIR /app/server

# Run as non-root user for security
USER node

# Expose the port your app runs on
EXPOSE 3000

# Start the server from the compiled production code
CMD ["node", "dist/index.js"]