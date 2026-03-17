# Stage 1: Зависимости
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: build
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma Client generation before Next.js build
RUN npx prisma generate

RUN npm run build

# Stage 3: prod
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Disable telemetry Next.js
ENV NEXT_TELEMETRY_DISABLED 1

# For Prisma work in prod
RUN apk add --no-cache openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Run
CMD ["node", "server.js"]