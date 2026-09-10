"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createEvent } from "@/app/actions";
import { eventSchema } from "@/lib/validations";
import { format } from "date-fns";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: Date;
}

const QUICK_EMOJIS = ["📅", "🏆", "🎨", "💻", "🏃", "🎵", "📚", "🍕", "🚗", "💼"];

export default function AddEventModal({ isOpen, onClose, defaultDate }: AddEventModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [startTime, setStartTime] = useState("15:00");
  const [endTime, setEndTime] = useState("16:00");
  const [emoji, setEmoji] = useState("📅");

  // Sync defaultDate when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialDate = defaultDate || new Date();
      setDateStr(format(initialDate, "yyyy-MM-dd"));
      setName("");
      setStartTime("15:00");
      setEndTime("16:00");
      setEmoji("📅");
      setError(null);
    }
  }, [isOpen, defaultDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Same schema the server action enforces, so the user sees a readable
    // message instead of a serialized ZodError.
    const parsed = eventSchema.safeParse({
      name: name.trim(),
      date: dateStr ? new Date(dateStr) : new Date(NaN),
      startTime,
      endTime,
      emoji,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the event details.");
      return;
    }

    startTransition(async () => {
      try {
        await createEvent(parsed.data);
        router.refresh();
        onClose();
      } catch {
        setError("Failed to create event. Please try again.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-ed-ink/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-ed-paper border-2 border-ed-ink p-6 shadow-[6px_6px_0px_0px_rgba(26,22,20,1)] animate-in fade-in zoom-in-95 duration-200 z-10">
        
        {/* Header */}
        <div className="border-b border-ed-rule pb-3 mb-5">
          <div className="flex justify-between items-start">
            <h3 className="font-display text-2xl font-bold text-ed-ink">
              Add Once-Off Event
            </h3>
            <button 
              onClick={onClose}
              className="text-ed-ink-light hover:text-ed-ink font-display text-lg leading-none cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="font-ui text-[0.65rem] uppercase tracking-widest text-ed-ink-light mt-1">
            Google Calendar-style Schedule Item
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-2 border border-ed-rust bg-ed-rust/5 text-ed-rust font-ui text-xs font-semibold uppercase tracking-wider text-center">
              ⚠️ {error}
            </div>
          )}

          {/* Event Name */}
          <div className="flex flex-col">
            <label className="font-ui text-[0.65rem] font-bold uppercase tracking-wider text-ed-ink-light mb-1">
              Event Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dentist Appointment, Family Dinner"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full font-ui text-sm border border-ed-rule bg-ed-bg p-2 text-ed-ink focus:outline-none focus:border-ed-rust focus:ring-1 focus:ring-ed-rust"
            />
          </div>

          {/* Grid for Date, Start & End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col col-span-2">
              <label className="font-ui text-[0.65rem] font-bold uppercase tracking-wider text-ed-ink-light mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full font-ui text-sm border border-ed-rule bg-ed-bg p-2 text-ed-ink focus:outline-none focus:border-ed-rust focus:ring-1 focus:ring-ed-rust"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-ui text-[0.65rem] font-bold uppercase tracking-wider text-ed-ink-light mb-1">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full font-ui text-sm border border-ed-rule bg-ed-bg p-2 text-ed-ink focus:outline-none focus:border-ed-rust focus:ring-1 focus:ring-ed-rust"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-ui text-[0.65rem] font-bold uppercase tracking-wider text-ed-ink-light mb-1">
                End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full font-ui text-sm border border-ed-rule bg-ed-bg p-2 text-ed-ink focus:outline-none focus:border-ed-rust focus:ring-1 focus:ring-ed-rust"
              />
            </div>
          </div>

          {/* Emoji Selector */}
          <div className="flex flex-col">
            <label className="font-ui text-[0.65rem] font-bold uppercase tracking-wider text-ed-ink-light mb-1">
              Emoji Icon
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={2}
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-12 text-center font-ui text-sm border border-ed-rule bg-ed-bg p-2 text-ed-ink focus:outline-none focus:border-ed-rust"
              />
              <div className="flex flex-wrap gap-1 items-center">
                {QUICK_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setEmoji(em)}
                    className={`w-7 h-7 flex items-center justify-center border font-ui text-sm cursor-pointer transition-colors ${emoji === em ? "border-ed-rust bg-ed-rust/10" : "border-ed-rule bg-ed-bg hover:border-ed-ink"}`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-ed-rule">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 border border-ed-rule bg-transparent text-ed-ink-light font-ui font-semibold uppercase tracking-wider text-xs hover:bg-ed-ink hover:text-ed-bg hover:border-ed-ink transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 border border-ed-ink bg-ed-ink text-ed-bg font-ui font-semibold uppercase tracking-wider text-xs hover:bg-ed-rust hover:border-ed-rust transition-colors cursor-pointer disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Add Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
