# Multi-stage Docker build for Netconf Tool
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci
RUN cd backend && npm ci
RUN cd frontend && npm ci

# Copy source code
COPY backend ./backend
COPY frontend ./frontend

# Build frontend
RUN cd frontend && npm run build

# Prepare backend with frontend assets
RUN rm -rf backend/dist && cp -r frontend/dist backend/

# Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/backend ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S netconf -u 1001

# Change ownership
RUN chown -R netconf:nodejs /app

# Switch to non-root user
USER netconf

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --spider http://localhost:3001/health || exit 1

# Start the application
CMD ["node", "index.js"]
