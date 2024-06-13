# Step 1. Rebuild the source code only when needed
FROM node:22-alpine3.19 AS builder

WORKDIR /app

COPY package.json yarn.lock* ./
# Omit --production flag for TypeScript devDependencies
RUN yarn --frozen-lockfile

COPY src ./src
COPY public ./public
COPY next.config.mjs .
COPY tsconfig.json .
COPY tailwind.config.ts .
COPY postcss.config.js .
COPY docker-entrypoint.sh .

# We replace NEXT_PUBLIC_* variables here with placeholders
# as next.js automatically replaces those during building
# Later the docker-entrypoint.sh script finds such variables and replaces them
# with the docker environment variables we have set
RUN NEXT_PUBLIC_MEMPOOL_API=APP_NEXT_PUBLIC_MEMPOOL_API \
    NEXT_PUBLIC_API_URL=APP_NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_NETWORK=APP_NEXT_PUBLIC_NETWORK \
    yarn build

# Step 2. Production image, copy all the files and run next
FROM node:22-alpine3.19 AS runner

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/docker-entrypoint.sh ./docker-entrypoint.sh
COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Uncomment the following line to disable telemetry at run time
ENV NEXT_TELEMETRY_DISABLED 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
STOPSIGNAL SIGTERM
