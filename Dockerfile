# Multi-stage build for Martin++ App

# Stage 1: Backend Build
FROM node:18-alpine AS backend-builder

# Install Python and build tools for native dependencies
RUN apk add --no-cache python3 py3-pip make g++

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/

# Install backend dependencies
RUN cd backend && npm ci --only=production

# Copy backend source
COPY backend/ ./backend/

# Build backend (TypeScript compilation)
RUN cd backend && npm run build

# Stage 2: Frontend Build (skipped for API-only deployment)
FROM node:18-alpine AS frontend-builder

# Create dummy build artifacts for Docker to work
RUN mkdir -p /app/frontend && echo "Frontend served separately" > /app/frontend/index.html

# Stage 3: Production Runtime
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S martin -u 1001

WORKDIR /app

# Copy built backend
COPY --from=backend-builder --chown=martin:nodejs /app/backend/dist ./backend/dist
COPY --from=backend-builder --chown=martin:nodejs /app/backend/package*.json ./backend/
COPY --from=backend-builder --chown=martin:nodejs /app/backend/src/config ./backend/dist/config

# Copy production node_modules for backend
COPY --from=backend-builder --chown=martin:nodejs /app/backend/node_modules ./backend/node_modules

# Copy built frontend static files (if deploying web version)
COPY --from=frontend-builder --chown=martin:nodejs /app/frontend ./frontend/

# Create logs directory
RUN mkdir -p logs && chown -R martin:nodejs logs

# Switch to non-root user
USER martin

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "backend/dist/index.js"]
