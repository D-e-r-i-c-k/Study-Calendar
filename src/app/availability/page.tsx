import { prisma } from "@/lib/db";
import ExtramuralForm from "./ExtramuralForm";
import { deleteExtramural } from "../actions";
import { revalidatePath } from "next/cache";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function AvailabilityPage() {
  const extramurals = await prisma.extramural.findMany({
    orderBy: [
      { dayOfWeek: "asc" },
      { startTime: "asc" }
    ],
  });

  // Group by day exactly as requested
  const grouped = extramurals.reduce((acc, curr) => {
    if (!acc[curr.dayOfWeek]) acc[curr.dayOfWeek] = [];
    acc[curr.dayOfWeek].push(curr);
    return acc;
  }, {} as Record<number, typeof extramurals>);

  async function removeBlock(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await deleteExtramural(id);
    revalidatePath("/availability");
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      <div className="flex justify-between items-end border-b-2 border-ed-ink pb-4 mb-12">
        <h1 className="font-display text-6xl italic text-ed-ink">Availability</h1>
        <p className="font-ui text-xs uppercase tracking-[0.2em] text-ed-ink-light font-bold text-right max-w-sm">
          Strict Temporal Censors and Extramurals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
        {/* Registration Form (Left Column) */}
        <div className="md:col-span-5 flex flex-col items-start border-r border-ed-rule pr-12 min-h-[50vh]">
          <h2 className="font-display text-2xl font-bold text-ed-ink mb-2">Declare Block</h2>
          <p className="font-ui text-xs text-ed-ink-faint mb-8 pr-4">
            Blocks registered here act as algorithmic censors. The scheduling engine will never plot academic sessions during these active trajectories.
          </p>
          <ExtramuralForm />
        </div>

        {/* Existing Ledger (Right Column) */}
        <div className="md:col-span-7">
           <div className="border-b-2 border-ed-ink pb-2 mb-6 flex justify-between items-end">
              <h3 className="font-ui text-xs uppercase tracking-[0.2em] font-bold text-ed-ink">Active Censors</h3>
           </div>

           {Object.keys(grouped).length === 0 ? (
             <p className="font-ui text-sm text-ed-ink-faint italic">No availability blocks currently filed.</p>
           ) : (
             <div className="space-y-12">
                {DAY_NAMES.map((dayName, idx) => {
                  const items = grouped[idx];
                  if (!items || items.length === 0) return null;

                  return (
                    <div key={idx}>
                      <h4 className="font-display text-xl font-bold text-ed-ink border-b-[2px] border-dotted border-ed-rule mb-4 tracking-wide">
                        {dayName}s
                      </h4>
                      <ul className="space-y-3">
                        {items.map((item) => (
                           <li key={item.id} className="flex items-center justify-between group pl-4">
                             <div className="flex items-center space-x-6">
                               <span className="font-ui text-sm text-ed-ink-light tracking-widest w-24">
                                 {item.startTime} - {item.endTime}
                               </span>
                               <span className="font-body text-xl font-medium text-ed-ink">
                                 {item.emoji} {item.name}
                               </span>
                             </div>

                             <form action={removeBlock}>
                               <input type="hidden" name="id" value={item.id} />
                               <button type="submit" className="font-ui text-xs uppercase tracking-wider text-ed-rust hover:text-ed-ink opacity-0 group-hover:opacity-100 transition-opacity">
                                 Revoke
                               </button>
                             </form>
                           </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
