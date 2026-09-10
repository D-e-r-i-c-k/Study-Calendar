---
name: verify-app
description: Boot the Next.js dev server, load the routes affected by recent changes, report server and browser console errors, then shut the server down. Use to verify a change actually works before committing or opening a PR.
---

# Verify the app

This repo has no test suite, so booting the app is the verification step. Run this before any
commit or PR.

## 1. Start the server

Start `npm run dev` as a background Bash command from the repo root. Wait for the `Ready in` /
`Local: http://localhost:3000` line before proceeding. If port 3000 is taken, Next.js picks another
port — read the actual port from the output, don't assume 3000.

## 2. Exercise the routes

Load the routes touched by the change. If unsure which, load all of them:

- `/` — dashboard (also runs `ensureSeeded()`)
- `/onboarding`
- `/subjects`
- `/examinations`
- `/availability`
- `/results`

`curl -s -o /dev/null -w '%{http_code}'` against each is the cheap check — anything other than
`200` is a failure. For UI or interaction changes, use the `claude-in-chrome` skill to actually
open the page, so you catch client-side render errors and read the browser console.

## 3. Collect errors

Check both sources:

- The dev server output for compile errors, unhandled server-action rejections, and Prisma errors.
- The browser console for hydration mismatches and client render errors (only visible via a real
  browser load, not curl).

Server-action failures in this app commonly surface as `"No primary user found."` — that means the
database has no user row, not that your change is broken. Seed with `npx tsx prisma/seed.ts` or load
`/` once to trigger `ensureSeeded()`.

## 4. Report and shut down

Always kill the dev server when done. Report a plain pass/fail with the **actual error text** for
anything that failed — never report a pass you did not observe.
