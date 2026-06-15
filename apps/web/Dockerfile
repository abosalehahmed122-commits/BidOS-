# Self-hosting image for the web app (Vercel is the recommended default).
# Build from the REPO ROOT:
#   docker build -f apps/web/Dockerfile -t bid-os-web .
#
# NOTE: long AI/document jobs should run on a separate always-on worker
# (BullMQ + Redis), not on serverless. This image serves the web/API tier.
FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/web/package.json apps/web/
COPY packages/core/package.json packages/core/
COPY packages/db/package.json packages/db/
COPY packages/ai/package.json packages/ai/
COPY packages/auth/package.json packages/auth/
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV BUILD_STANDALONE=1
RUN pnpm --filter @bid-os/db generate && pnpm turbo run build --filter=web

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
