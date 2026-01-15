# Base stage for all Node.js services
FROM node:18-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./

# ==========================================
# Builder Stage
# ==========================================
FROM base AS builder
# Copy source code
COPY . .
# Install all dependencies (including devDependencies for build)
RUN npm install
# Build the TypeScript code
RUN npm run build

# ==========================================
# Stage: Gateway
# ==========================================
FROM base AS gateway
WORKDIR /app
COPY --from=builder /app/dist/gateway ./dist/gateway
COPY --from=builder /app/package.json ./
# Install only production dependencies
RUN npm install --production
CMD ["node", "dist/gateway/index.js"]

# ==========================================
# Stage: Wazuh Adapter
# ==========================================
FROM base AS wazuh
WORKDIR /app
COPY --from=builder /app/dist/adapters/wazuh ./dist/adapters/wazuh
COPY --from=builder /app/package.json ./
RUN npm install --production
CMD ["node", "dist/adapters/wazuh/index.js"]

# ==========================================
# Stage: MISP Adapter
# ==========================================
FROM base AS misp
WORKDIR /app
COPY --from=builder /app/dist/adapters/misp ./dist/adapters/misp
COPY --from=builder /app/package.json ./
RUN npm install --production
CMD ["node", "dist/adapters/misp/index.js"]

# ==========================================
# Stage: Shuffle Adapter
# ==========================================
FROM base AS shuffle
WORKDIR /app
COPY --from=builder /app/dist/adapters/shuffle ./dist/adapters/shuffle
COPY --from=builder /app/package.json ./
RUN npm install --production
CMD ["node", "dist/adapters/shuffle/index.js"]

# ==========================================
# Stage: DFIR IRIS Adapter
# ==========================================
FROM base AS dfir-iris
WORKDIR /app
COPY --from=builder /app/dist/adapters/dfir-iris ./dist/adapters/dfir-iris
COPY --from=builder /app/package.json ./
RUN npm install --production
CMD ["node", "dist/adapters/dfir-iris/index.js"]
