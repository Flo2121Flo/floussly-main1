# Build stage for client
FROM node:18-alpine as client-builder

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install client dependencies
RUN npm ci

# Copy client source code
COPY client/ .

# Build client
RUN npm run build

# Build stage for server
FROM node:18-alpine as server-builder

WORKDIR /app

# Copy server package files
COPY package*.json ./

# Install server dependencies
RUN npm ci

# Copy server source code
COPY server/ ./server/
COPY prisma/ ./prisma/
COPY tsconfig*.json ./

# Generate Prisma client
RUN npx prisma generate

# Build server
RUN npm run build:server

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built files from builders
COPY --from=client-builder /app/client/dist ./client/dist
COPY --from=server-builder /app/dist ./dist
COPY --from=server-builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma/ ./prisma/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/server/index.js"] 