import { prisma } from "@/lib/db";
// v4-hard-refresh-tz-v2
import { carryReviewDebt, ensureSeeded } from "@/app/actions";
import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import CalendarManager from "@/components/calendar/CalendarManager";
import ReviewDebtNotice from "@/components/stats/ReviewDebtNotice";
import { SCHEDULER_DEFAULTS } from "@/lib/scheduler-defaults";
import {
  studyStreak,
  subjectStanding,
  todayAgenda,
  weeklyFigures,
  type StatSession,
} from "@/lib/stats";
import type { SessionType } from "@/lib/types";

export default async function DashboardPage() {
  await ensureSeeded();

  // Missed work is folded back into the remaining prep window before anything is
  // read, so this render already shows the corrected plan. Idempotent, so a
  // reload costs one query and no writes. Guarded: a scheduling failure must
  // never blank the dashboard.
  const debt = await carryReviewDebt().catch(() => null);

  const user = await prisma.user.findFirst({
    include: {
      subjects: true,
      extramurals: true,
      events: true,
    },
  });

  if (!user) return null;

  const tests = await prisma.test.findMany({
    where: { subject: { userId: user.id } },
    include: { subject: true },
    orderBy: { date: 'asc' }
  });

  const allSessions = await prisma.studySession.findMany({
    include: { test: { include: { subject: true } } },
    orderBy: { date: 'asc' }
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const upcomingTests = tests.filter(test => test.date >= todayStart);

  // One mapping of the rows already fetched above feeds every statistic, so the
  // insights cost no extra queries and src/lib/stats.ts stays Prisma-free.
  const now = new Date();
  const statSessions: StatSession[] = allSessions.map((s) => ({
    id: s.id,
    testId: s.testId,
    testName: s.test.name,
    subjectId: s.test.subjectId,
    subjectName: s.test.subject.name,
    subjectColor: s.test.subject.color,
    date: s.date,
    startTime: s.startTime,
    type: s.type as SessionType,
    completed: s.completed,
    // Rows ticked before completedAt existed fall back to the day they were
    // scheduled — the best approximation available.
    completedAt: s.completedAt ?? (s.completed ? s.date : null),
  }));

  const offDay = user.offDay ?? SCHEDULER_DEFAULTS.offDay;

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-[250px_1fr_280px] max-w-[1400px] mx-auto min-h-[calc(100vh-180px)]">
        <Sidebar subjects={user.subjects as any} tests={upcomingTests as any} />
        <main className="p-6">
          {debt && <ReviewDebtNotice debt={debt} />}
          <CalendarManager
            initialDate={new Date()}
            sessions={allSessions as any}
            extramurals={user.extramurals as any}
            tests={tests as any}
            events={user.events as any}
            offDay={offDay}
          />
        </main>
        <RightPanel
          stats={weeklyFigures(statSessions, now)}
          progress={subjectStanding(statSessions, now)}
          todayItems={todayAgenda(statSessions, now)}
          streak={studyStreak(statSessions, offDay, now)}
        />
      </div>
    </>
  );
}
