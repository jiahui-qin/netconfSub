# Multi-stage Docker build for Netconf Tool
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install
RUN cd backend && npm install
RUN cd frontend && npm install

# Copy source code
COPY backend ./backend
COPY frontend ./frontend

# Build frontend
RUN cd frontend && npm run build

# Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy built assets and dependencies
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend/dist ./backend/dist

# Set working directory to backend
WORKDIR /app/backend

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "index.js"]
