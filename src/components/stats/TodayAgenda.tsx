interface AgendaItem {
  time: string;
  title: string;
  subtitle: string;
  done: boolean;
}

interface TodayAgendaProps {
  items: AgendaItem[];
}

export default function TodayAgenda({ items }: TodayAgendaProps) {
  return (
    <div className="bg-ed-paper p-5 border border-ed-rule mt-4">
      <h4 className="font-display text-lg font-bold mb-3">Today&apos;s Edition</h4>
      {items.map((item, i) => (
        <div
          key={i}
          className={`flex gap-3 py-2.5 items-start ${
            i > 0 ? "border-t border-dotted border-ed-rule" : ""
          }`}
        >
          <span
            className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 border-[1.5px] ${
              item.done
                ? "bg-ed-olive border-ed-olive"
                : "border-ed-ink bg-transparent"
            }`}
          >
            {item.done && (
              <svg
                viewBox="0 0 12 12"
                className="w-full h-full text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M2 6l3 3 5-5" />
              </svg>
            )}
          </span>
          <div>
            <p className="font-ui text-[0.7rem] text-ed-ink-faint">{item.time}</p>
            <p className="font-body text-sm">
              {item.title} — {item.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
