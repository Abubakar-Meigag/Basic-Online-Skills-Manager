# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy source and build static files
COPY . .
RUN npm run build

# Stage 2: Production

FROM nginx:1.27-alpine AS production

# Copy built static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA routing config (all routes -> index.html)
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid


EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]