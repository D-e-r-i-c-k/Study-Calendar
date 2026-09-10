/**
 * One-off backfill for StudySession.completedAt (Phase 5).
 *
 *   npx tsx scripts/backfill-completed-at.ts
 *
 * The column was added after sessions had already been ticked off, so rows
 * completed before the migration have no timestamp. The session's own `date` is
 * the best available approximation of when the work happened — a session ticked
 * on the day it was scheduled is the normal case, and the streak only reads the
 * calendar day, not the clock time.
 *
 * Idempotent: only rows that are completed *and* still missing a timestamp are
 * touched, so re-running it is a no-op.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const stale = await prisma.studySession.findMany({
    where: { completed: true, completedAt: null },
    select: { id: true, date: true },
  });

  if (stale.length === 0) {
    console.log("Nothing to backfill — every completed session already has a timestamp.");
    return;
  }

  for (const session of stale) {
    await prisma.studySession.update({
      where: { id: session.id },
      data: { completedAt: session.date },
    });
  }

  console.log(`Backfilled completedAt on ${stale.length} completed session(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
