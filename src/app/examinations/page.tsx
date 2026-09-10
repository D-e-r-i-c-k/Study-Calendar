import { prisma } from "@/lib/db";
import ExaminationForm from "./ExaminationForm";
import SubjectMarker from "@/components/subjects/SubjectMarker";
import { deleteExamination, updateExamination } from "../actions";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";

export default async function ExaminationsPage() {
  const user = await prisma.user.findFirst();

  const subjects = user
    ? await prisma.subject.findMany({
        where: { userId: user.id },
        select: { id: true, name: true },
      })
    : [];

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const tests = user
    ? await prisma.test.findMany({
        where: {
          subject: { userId: user.id },
          date: { gte: todayStart },
        },
        include: { subject: true },
        orderBy: { date: "asc" },
      })
    : [];

  async function removeExamination(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await deleteExamination(id);
    revalidatePath("/examinations");
    revalidatePath("/");
  }

  async function amendExamination(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const date = new Date(formData.get("date") as string);
    const difficulty = Number(formData.get("difficulty"));
    const prepDays = Number(formData.get("prepDays"));

    if (Number.isNaN(date.getTime())) return;
    if (!(difficulty >= 1 && difficulty <= 10)) return;
    if (!(prepDays >= 1 && prepDays <= 30)) return;

    await updateExamination(id, { date, difficulty, prepDays });
    revalidatePath("/examinations");
    revalidatePath("/");
  }

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
                {tests.map((test) => (
                  <li key={test.id} className="relative pl-6 group">
                    {/* Timeline Spine */}
                    <div className="absolute left-0 top-2 bottom-[-24px] w-[2px] bg-ed-rule" />

                    {/* Date Node */}
                    <div className="absolute -left-[5px] top-2.5 w-3 h-3 rounded-full bg-ed-ink border-[3px] border-ed-bg z-10" />

                    <div className="bg-ed-paper/50 p-4 border border-ed-rule hover:border-ed-ink transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-ui text-[0.65rem] uppercase tracking-widest text-ed-ink-light font-bold mb-1">
                            {format(new Date(test.date), "EEEE, MMMM do, yyyy")}
                          </p>
                          <h4 className="font-display text-2xl font-bold text-ed-ink flex items-center gap-3">
                            {test.name}
                            <span className="border border-ed-ink leading-none" title={test.subject?.name}>
                              <SubjectMarker color={test.subject?.color} />
                            </span>
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
                          <form action={removeExamination} className="mt-2">
                            <input type="hidden" name="id" value={test.id} />
                            <button
                              type="submit"
                              className="font-ui text-[0.6rem] uppercase tracking-wider text-ed-rust hover:text-ed-ink opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Withdraw
                            </button>
                          </form>
                        </div>
                      </div>

                      {/* Amendment strip — revise the three fields the engine reads */}
                      <form
                        action={amendExamination}
                        className="mt-4 pt-4 border-t border-dotted border-ed-rule flex flex-wrap items-end gap-4 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
                      >
                        <input type="hidden" name="id" value={test.id} />
                        <label className="flex flex-col gap-1">
                          <span className="font-ui text-[0.6rem] uppercase tracking-widest text-ed-ink-light font-bold">Date</span>
                          <input
                            type="date"
                            name="date"
                            defaultValue={format(new Date(test.date), "yyyy-MM-dd")}
                            className="bg-transparent border-b border-ed-rule focus:border-ed-rust focus:outline-none font-ui text-sm py-1 text-ed-ink"
                          />
                        </label>
                        <label className="flex flex-col gap-1">
                          <span className="font-ui text-[0.6rem] uppercase tracking-widest text-ed-ink-light font-bold">Difficulty</span>
                          <input
                            type="number"
                            name="difficulty"
                            min="1"
                            max="10"
                            defaultValue={test.difficulty}
                            className="w-20 bg-transparent border-b border-ed-rule focus:border-ed-rust focus:outline-none font-ui text-sm py-1 text-ed-ink"
                          />
                        </label>
                        <label className="flex flex-col gap-1">
                          <span className="font-ui text-[0.6rem] uppercase tracking-widest text-ed-ink-light font-bold">Prep Days</span>
                          <input
                            type="number"
                            name="prepDays"
                            min="1"
                            max="30"
                            defaultValue={test.prepDays}
                            className="w-20 bg-transparent border-b border-ed-rule focus:border-ed-rust focus:outline-none font-ui text-sm py-1 text-ed-ink"
                          />
                        </label>
                        <button
                          type="submit"
                          className="border border-ed-ink px-4 py-1.5 font-ui text-[0.6rem] uppercase tracking-widest font-bold text-ed-ink hover:bg-ed-ink hover:text-ed-bg transition-colors"
                        >
                          Amend
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
             </ul>
           )}
        </div>
      </div>
    </div>
  );
}
