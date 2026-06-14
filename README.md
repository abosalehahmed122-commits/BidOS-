# Bid OS

منصة SaaS لإدارة وتحليل المناقصات السعودية — Bid OS. تستقبل كراسة الشروط، تستخرج المتطلبات
والمخاطر والمواعيد بالذكاء الاصطناعي، تقيّم فرصة الدخول (Bid/No-Bid)، وتولّد العرض الفني والمالي.
واجهة عربية RTL سينمائية.

> A SaaS platform for managing and analyzing Saudi government tenders. Arabic-first, RTL.

## Architecture

Turborepo monorepo:

| Package | Description |
|---|---|
| `apps/web` | Next.js 14 (App Router) — UI + Server Actions |
| `@bid-os/db` | Prisma schema, tenant-scoped client, seed |
| `@bid-os/core` | Zod schemas, RBAC, Bid-Score engine, constants |
| `@bid-os/ai` | Provider-agnostic AI layer (mock / Anthropic Claude vision) + extraction pipeline |
| `@bid-os/auth` | Password hashing, sessions, route guards |

## Quick start (no Docker / cloud needed)

```bash
pnpm install
pnpm db:generate          # generate Prisma client (no DB required)
pnpm dev                  # http://localhost:3000  (disk storage + mock AI + inline queue)
```

Dev defaults: `STORAGE_DRIVER=disk`, `AI_PROVIDER=mock`, `QUEUE_DRIVER=inline`,
`EMAIL_DRIVER=console`. No external service is required to run or build.

## With real services

```bash
docker compose up -d      # Postgres + Redis + MinIO
cp .env.example .env       # set DATABASE_URL, AI_PROVIDER=anthropic + ANTHROPIC_API_KEY, etc.
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Verify

```bash
pnpm db:validate          # schema is valid
pnpm typecheck            # types pass
pnpm test                 # unit tests (RBAC, Bid-Score, tenant isolation, extraction schema)
pnpm build                # full production build
```

## Deployment

- **Web** → Vercel (or any Node host).
- **Worker** (long-running AI/document jobs) → a separate always-on host (Railway / Render / VPS).
  Vercel's serverless time limits are not suitable for the analysis pipeline.

See `CLAUDE.md` for the full set of architectural decisions and project memory.
