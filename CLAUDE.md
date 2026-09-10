# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is npm (`package-lock.json` is the only lockfile).

- `npm run dev` — Next.js dev server
- `npm run build` — production build; **this is also the only type check** (`tsc --noEmit` is not wired up)
- `npm run lint` — bare `eslint`, not `next lint`
- `npx tsx prisma/seed.ts` — the seed script exists but is wired to no npm script or `prisma.seed` config, so run it manually
- `npx prisma db push` — how schema changes are applied

There is no test, format, or typecheck script.

## Database

SQLite via Prisma. The datasource url is `file:./dev.db`, and Prisma resolves relative SQLite paths
against **the schema file's directory** — so the live database is `prisma/dev.db` (committed).
The `dev.db` at the repo root is a stale leftover; never read or write it.

There is no `prisma/migrations/` directory. Schema changes go through `prisma db push`, not
`prisma migrate`.

## Architecture invariants

- **Single-user app, no auth.** Every mutation in `src/app/actions.ts` resolves the user with
  `prisma.user.findFirst()` and throws `"No primary user found."` if absent. Do not add a `userId`
  parameter to actions.
- `ensureSeeded()` runs at the top of `src/app/page.tsx` on every dashboard render. It no-ops once a
  user exists; otherwise it seeds from `src/lib/mock-data.ts`.
- **Two coexisting revalidation patterns.** Match the file you are in; do not unify them unasked.
  Server actions in `src/app/actions.ts` do *not* call `revalidatePath` — client forms wrap the call
  in `useTransition` + `router.refresh()`. Inline `"use server"` closures declared inside server
  pages (e.g. `src/app/subjects/page.tsx`, `src/app/availability/page.tsx`) *do* call
  `revalidatePath`.
- Route convention: each folder under `src/app/` pairs an async server `page.tsx` with a co-located
  `"use client"` form component.
- `src/lib/mock-data.ts` still backs parts of the dashboard (weekly stats, subject progress, today's
  agenda) — those are not DB-driven yet.

## Gotchas

- The comments `// v4-cache-break-tz-rename: 2026-05-22` (`src/lib/db.ts`) and
  `// v4-hard-refresh-tz-v2` (`src/app/page.tsx`), and the `globalForPrisma.prisma_v4` singleton key,
  are deliberate dev-cache busters left over from the timezone field rename. Renaming them re-breaks
  HMR state. Leave them as-is.
- `src/lib/types.ts` hand-written domain types deliberately diverge from Prisma's generated types
  (ISO strings vs `Date`; `Subject.color` as a narrow union vs `string`). `src/app/page.tsx` bridges
  the gap with `as any` casts on props. Do not "clean up" one of those casts without reconciling both
  type sources.
- Timezone support is shallow. `User.tz` is captured at onboarding but no component converts using
  it — all calendar math runs on browser/server-local time via `date-fns`. Do not assume
  tz-correctness.

## Style

- Path alias `@/*` → `./src/*`.
- Tailwind CSS v4, CSS-first: there is **no `tailwind.config`**. Theming lives in
  `src/app/globals.css` under `@theme inline`.
- shadcn/ui is configured on **`@base-ui/react`, not Radix** (`components.json`, style `base-nova`).
  Only `src/components/ui/button.tsx` is installed; add further primitives through the shadcn CLI.
- No Prettier or any formatter. Existing style: double quotes, semicolons, 2-space indent.
- Validation: zod v4 schemas in `src/lib/validations.ts`, consumed by `react-hook-form`.

## Workflow

- One feature per branch — branch off `main` before starting work.
- One feature per commit. Conventional commit messages (`feat:`, `refactor:`, `docs:`).
- Verify before opening a PR (`/verify-app`), then open the PR as a **draft** and stop.
  Never merge a PR or mark it ready for review — the user tests it first.
- Lint + build currently stand in for a test suite, because none exists.

## Reference

- `@app.md` — product spec (scheduling engine, spaced-repetition rules). Note it specifies
  PostgreSQL; the implementation deliberately uses SQLite instead.
- `@plan.md` — phase roadmap. Phase 3 (CRUD/input UIs) is the current phase.
