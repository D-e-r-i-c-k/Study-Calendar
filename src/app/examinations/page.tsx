import { prisma } from "@/lib/db";
import ExaminationForm from "./ExaminationForm";
import { format } from "date-fns";

export default async function ExaminationsPage() {
  const subjects = await prisma.subject.findMany({ select: { id: true, name: true } });
  
  const tests = await prisma.test.findMany({
    include: { subject: true },
    orderBy: { date: "asc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      <div className="flex justify-between items-end border-b-2 border-ed-ink pb-4 mb-12">
        <h1 className="font-display text-6xl italic text-ed-ink">Examinations</h1>
        <p className="font-ui text-xs uppercase tracking-[0.2em] text-ed-ink-light font-bold">
          Master Record of Impending Assessments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
        {/* Registration Form (Left Column) */}
        <div className="md:col-span-4 flex flex-col items-start border-r border-ed-rule pr-12 min-h-[50vh]">
          <h2 className="font-display text-2xl font-bold text-ed-ink mb-6">File New Record</h2>
          <ExaminationForm subjects={subjects} />
        </div>

        {/* Existing Tests Ledger (Right Column) */}
        <div className="md:col-span-8">
           <div className="border-b-2 border-ed-ink pb-2 mb-6 flex justify-between items-end">
              <h3 className="font-ui text-xs uppercase tracking-[0.2em] font-bold text-ed-ink">Chronological Slate</h3>
           </div>

           {tests.length === 0 ? (
             <p className="font-ui text-sm text-ed-ink-faint italic">No examinations currently filed.</p>
           ) : (
             <ul className="space-y-6">
                {tests.map((test) => {
                  const isHex = test.subject?.color?.startsWith("#");
                  return (
                    <li key={test.id} className="relative pl-6">
                      {/* Timeline Spine */}
                      <div className="absolute left-0 top-2 bottom-[-24px] w-[2px] bg-ed-rule" />
                      
                      {/* Date Node */}
                      <div className="absolute -left-[5px] top-2.5 w-3 h-3 rounded-full bg-ed-ink border-[3px] border-ed-bg z-10" />

                      <div className="flex items-start justify-between bg-ed-paper/50 p-4 border border-ed-rule hover:border-ed-ink transition-colors">
                        <div>
                           <p className="font-ui text-[0.65rem] uppercase tracking-widest text-ed-ink-light font-bold mb-1">
                             {format(new Date(test.date), "EEEE, MMMM do, yyyy")}
                           </p>
                           <h4 className="font-display text-2xl font-bold text-ed-ink flex items-center gap-3">
                             {test.name}
                             <span 
                               className={`w-2 h-2 border border-ed-ink inline-block ${isHex ? "" : test.subject?.color}`}
                               style={isHex ? { backgroundColor: test.subject?.color } : {}}
                               title={test.subject?.name}
                             />
                           </h4>
                           <p className="font-body text-sm text-ed-ink mt-1 italic">
                             {test.subject?.name}
                           </p>
                        </div>

                        <div className="text-right">
                          <p className="font-ui text-xs text-ed-ink uppercase tracking-wider">
                            Diff: <span className="font-display text-ed-rust text-lg">{test.difficulty}</span>/10
                          </p>
                          <p className="font-ui text-xs text-ed-ink-light mt-1">
                            {test.prepDays} days prep
                          </p>
                        </div>
                      </div>
                    </li>
                  )
                })}
             </ul>
           )}
        </div>
      </div>
    </div>
  );
}
