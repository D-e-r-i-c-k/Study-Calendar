# Smart Study Planner — Master Development Plan

This document serves as the master roadmap for the entire project, translating the core concepts from `app.md` into distinct, actionable development phases. 

---

## ✅ Phase 1: Infrastructure & Shell Construction [COMPLETED]

The goal was to establish the physical foundation, routing, and design language of the application.

- **Objective 1.1: Design Direction**
  - Establish the "Warm Broadsheet" / "Almanac Ledger" visual identity. 
  - Define exact Typography (Fraunces, Source Serif 4, Libre Franklin).
  - Define custom Tailwind tokens (`globals.css`) including paper noise patterns and ruling lines.
- **Objective 1.2: Architecture**
  - Boot Next.js 16 App Router.
  - Setup core component folders (`layout`, `calendar`, `subjects`, `tests`, `stats`).
- **Objective 1.3: Static UI Scaffolding**
  - Build Masthead, Sidebar, Right Panel stats, and calendar grid using static mock data.

---

## ✅ Phase 2: Database Layer & Interactive Navigation [COMPLETED]

The goal was to move from static mock-ups to a live, query-driven state model.

- **Objective 2.1: Local Database Engine**
  - Configure Prisma ORM with SQLite (`dev.db`).
  - Deploy standard domain schemas (Users, Subjects, Extramurals, Tests, StudySessions).
- **Objective 2.2: Data Access (Server Actions)**
  - Write `ensureSeeded()` bootstrap script.
  - Migrate frontend to fetch deeply-nested relational data directly via Next.js Server Components.
- **Objective 2.3: Interactive Calendar State**
  - Implement `<CalendarManager />` wrapping logic.
  - Use `date-fns` to fuel ‹ / › chronological navigation.
  - Build out the segmented view states:
    - **Week View:** 7-column stacked cards.
    - **Ledger (Month) View:** 5-week density matrix.
    - **Itinerary (Day) View:** Chronological vertical timeline stream.
- **Objective 2.4: Session Interactivity**
  - Pessimistic toggle completion states via `useTransition` and `router.refresh()`.

---

## ✅ Phase 3: Input & Management UIs [COMPLETED]

The goal is to build the actual CRUD (Create, Read, Update, Delete) forms so the user can interactively shape the data without manually seeding a database.

- **Objective 3.1: The Onboarding Wizard (`/onboarding`)**
  - Shipped as a single-page profile form rather than a multi-step wizard — the app is
    single-user with a seeded profile row, so there is no first-run flow to step through.
  - Captures academic profile and the hard chronological constraints (school end, arrival
    home, study cutoff, buffer). Recurring Extramurals live on `/availability`.
- **Objective 3.2: Examinations Management (`/examinations`)**
  - Interface to input Test specifics (Subject, Date, Preparation length, and 1-10 Difficulty metrics).
  - Amend and withdraw controls on the existing slate.
- **Objective 3.3: Subject Preferences (`/subjects`)**
  - Managing distinct subjects and associated color codes, with inline rename.
- **Objective 3.4: Settings (`/preferences`)**
  - Focus/break length, daily session and subject ceilings, weekend start, rest day and
    the spaced-repetition offsets. These are the inputs the Phase 4 engine reads.

---

## ✅ Phase 4: The Intelligent Scheduling Engine [COMPLETED]

The goal is to replace the mock session creation with the mathematically optimized scheduling generation logic described in the app specs. 

- **Objective 4.1: Available Study Load Matrix**
  - Algorithm to calculate the absolute maximum time slots available on any specific day (factoring in buffers, extramurals, and sleep limits).
- **Objective 4.2: The Spaced Repetition Ruleset**
  - Map Difficulty variables to Session volume requirements (e.g. Difficulty 8 = ~12 required sessions).
  - Standardize biological spacing across days (Day 1, 2, 4, 7).
- **Objective 4.3: Session Instantiation Algorithm (`generateSchedule`)**
  - Inject computed sessions into available daily slots.
  - Force interleaving: Ensure consecutive daily sessions switch between distinct subjects.
  - Format blocks into strict 25m Focus / 5m Break structures internally.

**As built.** `src/lib/scheduler/` — `load.ts` (difficulty → workload), `spacing.ts` (the
repetition curve), `availability.ts` (the daily slot grid) and `generate.ts` (placement).
The modules are Prisma-free and pure; `scripts/scheduler-check.ts` exercises them against the
live database or a `--demo` fixture and asserts the app.md §5.3–5.4 invariants, standing in
for the test suite this repo does not have.

Generation is triggered explicitly by the **Generate Schedule** button on the dashboard.
`regenerateSchedule()` rebuilds only future, uncompleted sessions — completed work is
preserved, its slots are withheld from the engine, and it counts against its exam's remaining
workload. Demands that cannot fit are reported as overflow rather than silently dropped.

---

## ⏳ Phase 5: Dynamic Resilience & Polishing [NEXT UP]

The goal is to ensure the app doesn't break conceptually when life happens—dynamically recalculating the schedule on missed tasks or shifted milestones.

- **Objective 5.1: Recalculation Triggers**
  - When new exams/extramurals are added, recalculate future uncompleted segments without destroying historical data logs.
  - The mechanism exists (`regenerateSchedule()`); what remains is firing it automatically
    rather than only from the button.
- **Objective 5.2: "Review Debt" Pipeline**
  - Automatically cascade uncompleted past sessions into today's timeline if a user misses a day naturally.
- **Objective 5.3: Gamification & Insights**
  - Populate Sidebar metrics with live SQL aggregate stats (Completion Ratio, Weak Subjects).
  - The right panel (weekly figures, subject standing, today's agenda) is still the last of
    `src/lib/mock-data.ts` reaching the UI.
  - Implement "Streak" mechanisms or visual rewards.

---

## 🚀 Phase 6: Production Readiness & Release [THE LAUNCH]

The goal is to harden the application, implement secure authentication, migrate from our local development database to a managed cloud database, and deploy to the public web.

- **Objective 6.1: Authentication & User Accounts**
  - Implement authentication via explicit credential flows or OAuth providers (e.g., using NextAuth.js or Clerk).
  - Secure API routes and Server Actions so users can only read/mutate their respective data.
- **Objective 6.2: Production Database Migration**
  - Migrate out of the local `SQLite` rapid-prototyping environment.
  - Provision a production-grade PostgreSQL instance (e.g., Supabase, Vercel Postgres, or Neon).
  - Update `schema.prisma` provider to `postgresql` and run initialization migrations against the cloud DB.
- **Objective 6.3: Code Hardening & Performance**
  - Comprehensive TypeScript strict auditing and linting.
  - Implement proper Error boundaries, loading states (Suspense/skeletons for the schedule generation lag), and Toast notifications for mutations.
  - Automate SEO metadata and Open Graph image tags.
- **Objective 6.4: Deployment & CI/CD**
  - Deploy the Next.js 16 application to Vercel.
  - Connect environment variables securely.
  - Perform live domain linking, end-to-end user sanity checks, and final V1.0 release.

---
*Created per App documentation requirements. Maintained as the project's golden path until Production Launch.*
