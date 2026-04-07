import { prisma } from "@/lib/db";
import { ensureSeeded } from "@/app/actions";
import Masthead from "@/components/layout/Masthead";
import EdNav from "@/components/layout/EdNav";
import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import CalendarManager from "@/components/calendar/CalendarManager";
import { subjectProgress, todayAgenda, weeklyStats } from "@/lib/mock-data";

export default async function DashboardPage() {
  await ensureSeeded();

  const user = await prisma.user.findFirst({
    include: {
      subjects: true,
      extramurals: true,
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

  return (
    <>
      <Masthead />
      <EdNav />
      <div className="grid grid-cols-1 xl:grid-cols-[250px_1fr_280px] max-w-[1400px] mx-auto min-h-[calc(100vh-180px)]">
        <Sidebar subjects={user.subjects as any} tests={tests as any} />
        <main className="p-6">
          <CalendarManager 
            initialDate={new Date()}
            sessions={allSessions as any}
            extramurals={user.extramurals as any}
          />
        </main>
        <RightPanel
          stats={weeklyStats}
          progress={subjectProgress}
          todayItems={todayAgenda}
        />
      </div>
    </>
  );
}
