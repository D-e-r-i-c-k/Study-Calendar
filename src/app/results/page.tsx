import { prisma } from "@/lib/db";
import SubjectMarker from "@/components/subjects/SubjectMarker";
import { format } from "date-fns";
import ResultForm from "./ResultForm";

export default async function ResultsPage() {
  const user = await prisma.user.findFirst();
  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-8 py-12 text-center">
        <p className="font-ui text-sm text-ed-ink-faint italic">No primary user found.</p>
      </div>
    );
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const pastTests = await prisma.test.findMany({
    where: {
      subject: { userId: user.id },
      date: { lt: todayStart },
    },
    include: { subject: true },
    orderBy: { date: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      <div className="flex justify-between items-end border-b-2 border-ed-ink pb-4 mb-12">
        <h1 className="font-display text-6xl italic text-ed-ink">Results</h1>
        <p className="font-ui text-xs uppercase tracking-[0.2em] text-ed-ink-light font-bold">
          Historical Slate and Outcomes of Assessments
        </p>
      </div>

      <div className="border-b-2 border-ed-ink pb-2 mb-6 flex justify-between items-end">
        <h3 className="font-ui text-xs uppercase tracking-[0.2em] font-bold text-ed-ink">Historical Ledger</h3>
        <p className="font-ui text-[0.65rem] text-ed-ink-light font-semibold uppercase tracking-wider">
          Total Past Assessments: {pastTests.length}
        </p>
      </div>

      {pastTests.length === 0 ? (
        <div className="py-12 border border-dashed border-ed-rule text-center bg-ed-paper/30">
          <p className="font-display text-2xl italic text-ed-ink mb-2">No Past Examinations</p>
          <p className="font-ui text-xs text-ed-ink-faint">
            Examinations scheduled in the past will appear here to record outcomes.
          </p>
        </div>
      ) : (
        <div className="bg-ed-paper/40 border border-ed-rule overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-ed-rule bg-ed-paper/80 font-ui text-[0.65rem] uppercase tracking-wider text-ed-ink-light font-bold">
                <th className="py-4 px-6 w-32">Date</th>
                <th className="py-4 px-6 w-48">Subject</th>
                <th className="py-4 px-6">Assessment</th>
                <th className="py-4 px-6 w-32 text-center">Difficulty</th>
                <th className="py-4 px-6 w-48 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ed-rule">
              {pastTests.map((test) => {
                return (
                  <tr key={test.id} className="hover:bg-ed-paper/60 transition-colors font-body text-ed-ink">
                    {/* Date */}
                    <td className="py-4 px-6 font-ui text-xs font-semibold tracking-wider text-ed-ink-light">
                      {format(new Date(test.date), "MMM d, yyyy")}
                    </td>

                    {/* Subject */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="border border-ed-ink inline-block leading-none">
                          <SubjectMarker color={test.subject?.color} />
                        </span>
                        <span className="font-semibold text-base">{test.subject.name}</span>
                      </div>
                    </td>

                    {/* Assessment Name */}
                    <td className="py-4 px-6">
                      <span className="text-lg font-bold">{test.name}</span>
                    </td>

                    {/* Difficulty */}
                    <td className="py-4 px-6 text-center font-ui text-sm">
                      <span className="font-display text-base text-ed-rust font-semibold">{test.difficulty}</span>
                      <span className="text-ed-ink-faint">/10</span>
                    </td>

                    {/* Result (form) */}
                    <td className="py-4 px-6 text-right">
                      <div className="inline-block text-left">
                        <ResultForm testId={test.id} initialResult={test.result} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
