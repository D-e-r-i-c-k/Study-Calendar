---
name: ship-feature
description: Branch, verify, commit, and open a draft PR for one feature following this repo's conventions.
disable-model-invocation: true
---

# Ship a feature

`$ARGUMENTS` is a short description of the feature being shipped.

Follow these steps in order. Stop and report if any step fails — do not work around a failure.

## 1. Check scope

Run `git status` and `git diff --stat`. This repo's rule is **one feature per commit**. If the
working tree contains more than one logical change, stop and ask the user how to split it rather
than committing a mixed changeset.

## 2. Branch

If currently on `main`, create a feature branch off it (`feat/<short-slug>` or `fix/<short-slug>`).
Never commit directly to `main`.

## 3. Verify

Run, in order:

1. `npm run lint`
2. `npm run build` — this is also the type check
3. The `/verify-app` skill

Lint + build stand in for a test suite because this repo has none. All three must pass before
committing.

## 4. Commit

One commit for the feature, with a conventional message (`feat:`, `fix:`, `refactor:`, `docs:`)
in the style of the existing history. Include the session attribution footer from this session's
instructions.

Do not stage `prisma/dev.db` unless the schema or seed data genuinely changed as part of the
feature.

## 5. Open a draft PR

Push the branch and run `gh pr create --draft`. Report the PR URL and **stop**.

Do not merge the PR. Do not mark it ready for review. Do not push further commits to it unless the
user asks. The user tests the draft PR themselves first.
