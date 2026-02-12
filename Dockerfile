# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm with specific version matching packageManager
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including dev for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm run build

# Install drizzle-kit globally for migrations (before pruning)
RUN npm install -g drizzle-kit

# Prune dev dependencies after build
RUN pnpm prune --prod

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install drizzle-kit globally for migrations
RUN npm install -g drizzle-kit

# Copy built artifacts and production node_modules from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Create uploads directory with proper permissions
RUN mkdir -p uploads && chown -R node:node /app

# Use non-root user for security
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start command
CMD ["node", "dist/index.js"]
