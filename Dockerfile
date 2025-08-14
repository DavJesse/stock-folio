# -------------------------
# 1. Base builder stage
# -------------------------
FROM node:24-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        g++ libsqlite3-dev make pkg-config python3 && \
    rm -rf /var/lib/apt/lists/*

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy application source and build
COPY . .
RUN npm run build

# Compile TypeScript scripts to JavaScript
RUN npx tsc scripts/init-db.ts \
    --outDir ./scripts-compiled \
    --target es2022 \
    --module node16 \
    --moduleResolution node16 \
    --esModuleInterop \
    --allowSyntheticDefaultImports

# -------------------------
# 2. Production runtime stage
# -------------------------
FROM node:24-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

# Install only runtime dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends libsqlite3-0 && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir -p /app/db && chmod 755 /app/db

# Declare volume after directory creation
VOLUME /app/db

# Copy package files and install production dependencies + tsx
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production && npm install tsx && npm cache clean --force
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/middleware.ts ./middleware.ts
COPY --from=builder /app/scripts-compiled ./scripts-compiled
COPY --from=builder /app/db ./db

# Run migrations on container start, then start the app
CMD ["sh", "-c", "node scripts-compiled/init-db.js && npm start"]

EXPOSE 3000
