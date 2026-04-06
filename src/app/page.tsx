import Masthead from "@/components/layout/Masthead";
import EdNav from "@/components/layout/EdNav";
import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import {
  subjects,
  tests,
  getWeekSchedule,
  weeklyStats,
  subjectProgress,
  todayAgenda,
} from "@/lib/mock-data";

export default function DashboardPage() {
  const week = getWeekSchedule();

  return (
    <>
      <Masthead />
      <EdNav />
      <div className="grid grid-cols-1 xl:grid-cols-[250px_1fr_280px] max-w-[1400px] mx-auto min-h-[calc(100vh-180px)]">
        <Sidebar subjects={subjects} tests={tests} />
        <main className="p-6">
          <CalendarGrid week={week} />
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
