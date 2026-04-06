interface WeekHeaderProps {
  weekNumber: number;
  startDate: string;
  endDate: string;
}

export default function WeekHeader({
  weekNumber,
  startDate,
  endDate,
}: WeekHeaderProps) {
  const words = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
    "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
    "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty",
  ];

  const weekWord = weekNumber <= 20 ? words[weekNumber] : String(weekNumber);

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex items-baseline justify-between mb-2">
      <div>
        <h2 className="font-display text-3xl font-bold">
          Week {weekWord}
        </h2>
        <span className="font-ui text-xs text-ed-ink-light uppercase tracking-[0.1em]">
          {formatDate(startDate)} – {formatDate(endDate)}
        </span>
      </div>
      <div className="flex gap-2">
        <button className="w-8 h-8 border border-ed-rule bg-transparent font-display text-base text-ed-ink cursor-pointer transition-all duration-300 hover:bg-ed-ink hover:text-ed-bg">
          ‹
        </button>
        <button className="w-8 h-8 border border-ed-rule bg-transparent font-display text-base text-ed-ink cursor-pointer transition-all duration-300 hover:bg-ed-ink hover:text-ed-bg">
          ›
        </button>
      </div>
    </div>
  );
}
