# Production-ready multi-stage Dockerfile for Next.js
# Supports multi-platform builds (amd64/arm64)
# Build with: docker buildx build --platform linux/amd64,linux/arm64 -t your-image:tag .

FROM --platform=$BUILDPLATFORM node:20-alpine AS builder
WORKDIR /app

# Build arguments for cross-compilation
ARG TARGETPLATFORM
ARG BUILDPLATFORM
ARG TARGETOS
ARG TARGETARCH

# Install basic build tools
RUN apk add --no-cache libc6-compat python3 make g++ git

# Copy lockfile & package manifest first for better caching
COPY package.json package-lock.json ./

# Install dependencies (including dev deps for the build)
RUN npm ci

# Copy rest of the sources and build
COPY . .
RUN npm run build

# Runner stage (smaller image)
FROM --platform=$TARGETPLATFORM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary artifacts from the builder
# The standalone output includes a minimal server.js and all required dependencies
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to non-root user
USER nextjs

# Expose port and default env
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
EXPOSE 3000

# Start the Next.js server in standalone mode
CMD ["node", "server.js"]