import { prisma } from "@/lib/db";
import SubjectForm from "./SubjectForm";
import { deleteSubject } from "../actions";
import { revalidatePath } from "next/cache";

export default async function SubjectsPage() {
  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
  });

  async function removeSubject(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await deleteSubject(id);
    revalidatePath("/subjects");
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      <div className="flex justify-between items-end border-b-2 border-ed-ink pb-4 mb-12">
        <h1 className="font-display text-6xl italic text-ed-ink">Departments</h1>
        <p className="font-ui text-xs uppercase tracking-[0.2em] text-ed-ink-light font-bold">
          Master Register of Study Disciplines
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
        {/* Registration Form (Left Column) */}
        <div className="md:col-span-4 flex flex-col items-start border-r border-ed-rule pr-12 min-h-[50vh]">
          <h2 className="font-display text-2xl font-bold text-ed-ink mb-6">New Department</h2>
          <SubjectForm />
        </div>

        {/* Existing Subjects Ledger (Right Column) */}
        <div className="md:col-span-8">
           <div className="border-b-2 border-ed-ink pb-2 mb-6 flex justify-between items-end">
              <h3 className="font-ui text-xs uppercase tracking-[0.2em] font-bold text-ed-ink">Active Registry</h3>
              <span className="font-ui text-[0.65rem] text-ed-ink-light uppercase">Standing</span>
           </div>

           {subjects.length === 0 ? (
             <p className="font-ui text-sm text-ed-ink-faint italic">No departments currently registered.</p>
           ) : (
             <ul className="space-y-4">
                {subjects.map((subject) => {
                  const isHex = subject.color.startsWith("#");
                  return (
                  <li key={subject.id} className="flex items-center justify-between group">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Color Swatch Indicator */}
                      <span 
                        className={`w-3 h-3 border border-ed-ink flex-shrink-0 ${isHex ? "" : subject.color}`} 
                        style={isHex ? { backgroundColor: subject.color } : {}}
                      />
                      
                      {/* Typographic Label with Leader Pattern */}
                      <span className="font-body text-xl font-medium text-ed-ink flex-shrink-0 bg-ed-bg pr-4 relative z-10">
                        {subject.name}
                      </span>
                      
                      {/* Dotted Leader Line */}
                      <div className="flex-1 border-b-[3px] border-dotted border-ed-rule mx-2 transform translate-y-[-6px]" />
                    </div>

                    <div className="flex items-center space-x-6 bg-ed-bg pl-4 relative z-10">
                      {/* Placeholder standing, can be populated live later */}
                      <span className="font-ui text-sm font-bold text-ed-ink-light">N/A</span>
                      
                      {/* Subdued Remove Form */}
                      <form action={removeSubject}>
                        <input type="hidden" name="id" value={subject.id} />
                        <button type="submit" className="font-ui text-[0.6rem] uppercase tracking-wider text-ed-rust hover:text-ed-ink opacity-0 group-hover:opacity-100 transition-opacity">
                          Revoke
                        </button>
                      </form>
                    </div>
                  </li>
                  );
                })}
             </ul>
           )}
        </div>
      </div>
    </div>
  );
}
