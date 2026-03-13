# ── Stage 1: Build ────────────────────────────────────────
FROM node:20-slim AS build

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Production ──────────────────────────────────
FROM node:20-slim AS production

WORKDIR /app

# Only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Install curl for health checks
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Copy compiled output from build stage
COPY --from=build /app/dist ./dist

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "dist/src/main.js"]
