# Step 1. Rebuild the source code only when needed
FROM node:22.6.0-alpine3.20 AS builder

WORKDIR /app

COPY package.json package-lock.json ./
# Install dependencies with npm
RUN npm ci

COPY src ./src
COPY public ./public
COPY next.config.mjs .
COPY tsconfig.json .
COPY tailwind.config.ts .
COPY postcss.config.js .
COPY sentry.client.config.ts .

RUN sed -i '/images: { unoptimized: true },/d' next.config.mjs && \
    sed -i 's/output: "export"/output: "standalone"/' next.config.mjs

ARG VITE_MEMPOOL_API
ENV VITE_MEMPOOL_API=${VITE_MEMPOOL_API}

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

ARG VITE_NETWORK
ENV VITE_NETWORK=${VITE_NETWORK}

ARG VITE_DISPLAY_TESTING_MESSAGES
ENV VITE_DISPLAY_TESTING_MESSAGES=${VITE_DISPLAY_TESTING_MESSAGES}

ARG VITE_SENTRY_DSN
ENV VITE_SENTRY_DSN=${VITE_SENTRY_DSN}

ARG VITE_COMMIT_HASH
ENV VITE_COMMIT_HASH=$VITE_COMMIT_HASH

ARG VITE_FIXED_STAKING_TERM
ENV VITE_FIXED_STAKING_TERM=${VITE_FIXED_STAKING_TERM}

ARG VITE_BBN_GAS_PRICE
ENV VITE_BBN_GAS_PRICE=${VITE_BBN_GAS_PRICE}

ARG VITE_DISABLED_WALLETS
ENV VITE_DISABLED_WALLETS=${VITE_DISABLED_WALLETS}

ARG VITE_SIDECAR_API_URL
ENV VITE_SIDECAR_API_URL=${VITE_SIDECAR_API_URL}

ARG VITE_STAKING_DISABLED
ENV VITE_STAKING_DISABLED=${VITE_STAKING_DISABLED}

ARG VITE_BABYLON_EXPLORER
ENV VITE_BABYLON_EXPLORER=${VITE_BABYLON_EXPLORER}

ARG VITE_REPLAYS_RATE
ENV VITE_REPLAYS_RATE=${VITE_REPLAYS_RATE}

ARG SENTRY_ORG
ENV SENTRY_ORG=${SENTRY_ORG}

ARG SENTRY_PROJECT
ENV SENTRY_PROJECT=${SENTRY_PROJECT}

ARG SENTRY_AUTH_TOKEN
ENV SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}

ARG SENTRY_URL
ENV SENTRY_URL=${SENTRY_URL}

RUN npm run build

# Step 2. Production image, copy all the files and run next
FROM node:22-alpine3.19 AS runner

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Uncomment the following line to disable telemetry at run time
ENV NEXT_TELEMETRY_DISABLED 1

CMD ["node", "server.js"]
STOPSIGNAL SIGTERM
