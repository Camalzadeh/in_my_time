# Production image.
#
# The site runs on Vercel, so this is for self-hosting. The previous version had
# four problems worth naming: `npm install` instead of `npm ci` (so the lockfile
# was advisory), no standalone output (so the image carried every one of
# node_modules), the app ran as root, and there was no HEALTHCHECK — which meant
# a deploy script watching the container would call a broken release healthy.

FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund


FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build


FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# next/font caches fonts at build time, but the runtime still wants a CA bundle
# for the outbound TLS to MongoDB and Ably.
RUN apk add --no-cache ca-certificates wget \
    && addgroup -g 1001 -S nodejs \
    && adduser -u 1001 -S nextjs -G nodejs

COPY --from=builder /app/public ./public

# `output: "standalone"` writes a minimal server plus only the modules it
# actually reaches; static assets are copied alongside it.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Without this a container that boots but cannot serve still reports healthy,
# and a pull-based deploy will happily leave it in place.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
