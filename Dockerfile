# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install all dependencies (including dev for build)
RUN pnpm install

# Copy source code
COPY . .

# Build application
RUN pnpm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install production dependencies only
RUN pnpm install --prod

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start command
CMD ["node", "dist/index.js"]
