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

ARG NEXT_PUBLIC_MEMPOOL_API
ENV NEXT_PUBLIC_MEMPOOL_API=${NEXT_PUBLIC_MEMPOOL_API}

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

ARG NEXT_PUBLIC_NETWORK
ENV NEXT_PUBLIC_NETWORK=${NEXT_PUBLIC_NETWORK}

ARG NEXT_PUBLIC_DISPLAY_TESTING_MESSAGES
ENV NEXT_PUBLIC_DISPLAY_TESTING_MESSAGES=${NEXT_PUBLIC_DISPLAY_TESTING_MESSAGES}

ARG NEXT_PUBLIC_SENTRY_DSN
ENV NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN}

ARG NEXT_PUBLIC_COMMIT_HASH
ENV NEXT_PUBLIC_COMMIT_HASH=$NEXT_PUBLIC_COMMIT_HASH

ARG NEXT_PUBLIC_FIXED_STAKING_TERM
ENV NEXT_PUBLIC_FIXED_STAKING_TERM=${NEXT_PUBLIC_FIXED_STAKING_TERM}

ARG NEXT_PUBLIC_BBN_GAS_PRICE
ENV NEXT_PUBLIC_BBN_GAS_PRICE=${NEXT_PUBLIC_BBN_GAS_PRICE}

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
