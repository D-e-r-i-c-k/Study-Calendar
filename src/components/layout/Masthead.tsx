export default function Masthead() {
  const today = new Date();
  const formatted = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="text-center py-8 pb-3 border-b-2 border-ed-ink">
      <p className="font-ui text-[0.7rem] uppercase tracking-[0.25em] text-ed-ink-light mb-2">
        {formatted}
      </p>
      <h1 className="font-display text-5xl md:text-6xl font-black tracking-tight leading-none mb-1">
        The Study Planner
      </h1>
      <div className="flex items-center gap-4 max-w-md mx-auto mt-3">
        <span className="flex-1 h-px bg-ed-ink" />
        <span className="font-display italic text-sm text-ed-ink-light whitespace-nowrap">
          Knowledge Through Discipline
        </span>
        <span className="flex-1 h-px bg-ed-ink" />
      </div>
    </header>
  );
}
