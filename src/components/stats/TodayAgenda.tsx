"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleSessionCompletion } from "@/app/actions";
import type { AgendaItem } from "@/lib/stats";

interface TodayAgendaProps {
  items: AgendaItem[];
}

export default function TodayAgenda({ items }: TodayAgendaProps) {
  return (
    <div className="bg-ed-paper p-5 border border-ed-rule mt-4">
      <h4 className="font-display text-lg font-bold mb-3">Today&apos;s Edition</h4>

      {items.length === 0 ? (
        <p className="font-body text-sm text-ed-ink-light italic">
          Nothing scheduled today.
        </p>
      ) : (
        items.map((item, i) => (
          <AgendaRow key={item.id} item={item} divided={i > 0} />
        ))
      )}
    </div>
  );
}

/**
 * Ticking here writes straight through to the same action the calendar cards
 * use. The box flips immediately via useOptimistic, which also snaps back to
 * the server's answer once the transition settles — so a failed write reverts
 * itself with no error handling of its own.
 */
function AgendaRow({ item, divided }: { item: AgendaItem; divided: boolean }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [done, setDone] = useOptimistic(item.done);

  const toggle = () => {
    startTransition(async () => {
      const next = !done;
      setDone(next);
      await toggleSessionCompletion(item.id, next);
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={done}
      className={`w-full text-left flex gap-3 py-2.5 items-start cursor-pointer group ${
        divided ? "border-t border-dotted border-ed-rule" : ""
      }`}
    >
      <span
        className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 border-[1.5px] transition-colors ${
          done
            ? "bg-ed-olive border-ed-olive"
            : "border-ed-ink bg-transparent group-hover:border-ed-rust"
        }`}
      >
        {done && (
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
        <p className={`font-body text-sm ${done ? "text-ed-ink-light line-through decoration-ed-rule" : ""}`}>
          {item.title} — {item.subtitle}
        </p>
      </div>
    </button>
  );
}
