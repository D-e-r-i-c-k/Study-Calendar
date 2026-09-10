import { prisma } from "@/lib/db";
import Link from "next/link";
import PreferencesForm from "./PreferencesForm";

export default async function PreferencesPage() {
  const user = await prisma.user.findFirst();

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <div className="flex flex-col items-center border-b-2 border-ed-ink pb-8 mb-12 text-center">
        <h1 className="font-display text-6xl italic text-ed-ink mb-4">Master Preferences</h1>
        <p className="font-ui text-sm uppercase tracking-[0.2em] text-ed-ink-light font-bold max-w-xl mx-auto leading-relaxed">
          The dials the scheduling engine turns. Adjust the focus rhythm, the daily ceiling and the
          spaced-repetition curve, then regenerate your timeline.
        </p>
        <Link
          href="/onboarding"
          className="font-ui text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ed-ink-light hover:text-ed-rust mt-6 border-b border-ed-rule pb-0.5 transition-colors"
        >
          ← Back to academic profile
        </Link>
      </div>

      <div className="bg-ed-paper/50 border border-ed-rule p-8 md:p-12 shadow-sm">
        <PreferencesForm initialData={user} />
      </div>
    </div>
  );
}
