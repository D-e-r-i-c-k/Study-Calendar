import { prisma } from "@/lib/db";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const user = await prisma.user.findFirst();

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <div className="flex flex-col items-center border-b-2 border-ed-ink pb-8 mb-12 text-center">
        <h1 className="font-display text-6xl italic text-ed-ink mb-4">Master Preferences</h1>
        <p className="font-ui text-sm uppercase tracking-[0.2em] text-ed-ink-light font-bold max-w-xl mx-auto leading-relaxed">
          Establish your foundational operating parameters. The algorithmic engine requires these strict boundaries to generate your optimal timeline.
        </p>
      </div>

      <div className="bg-ed-paper/50 border border-ed-rule p-8 md:p-12 shadow-sm">
        <OnboardingForm initialData={user} />
      </div>
    </div>
  );
}
