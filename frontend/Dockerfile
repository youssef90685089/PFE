# Multi-stage build for React frontend
# Stage 1: Build
FROM node:18-alpine as builder

WORKDIR /build
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Runtime
FROM nginx:alpine

# Copy built React app
COPY --from=builder /build/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -g 1000 www-app && \
    adduser -D -u 1000 -G www-app www-app && \
    chown -R www-app:www-app /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

USER www-app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/index.html || exit 1

# Expose port
EXPOSE 80 443

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
