import { isSameDay, startOfDay } from "date-fns";
import { bufferFor } from "./load";
import { overlaps, toMinutes, toTimeString } from "./time";
import type { BusyBlock, SchedulerSettings, SchedulerUser } from "./types";

// --- Available study load matrix (app.md §5.3, plan Objective 4.1) ---
//
// The absolute ceiling of study slots a given day can hold, once school hours,
// the daily buffer, extramurals, once-off events and the study cutoff are all
// subtracted. Slots are (session + break) wide, so the 25m focus / 5m break
// structure of app.md §6 falls out of the slot pitch: only the focus half ever
// becomes a StudySession.
//
// All arithmetic runs on local time via date-fns, matching the rest of the app.
// User.tz is captured but not yet honoured anywhere — see CLAUDE.md.

export function computeDaySlots(
  user: SchedulerUser,
  settings: SchedulerSettings,
  busy: BusyBlock[],
  date: Date
): string[] {
  const dayOfWeek = date.getDay();

  // The mandatory rest day is absolute.
  if (dayOfWeek === settings.offDay) return [];

  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const windowOpen =
    toMinutes(isWeekend ? settings.studyStartWeekend : settings.studyStartWeekday) +
    bufferFor(user, dayOfWeek);
  const windowClose = toMinutes(settings.studyEnd);

  if (windowClose - windowOpen < settings.sessionMinutes) return [];

  const blocked = busyIntervalsFor(busy, date);
  const pitch = settings.sessionMinutes + settings.breakMinutes;

  const slots: string[] = [];
  let cursor = windowOpen;

  while (cursor + settings.sessionMinutes <= windowClose) {
    if (slots.length >= settings.maxSessionsPerDay) break;

    const clash = blocked.find((b) =>
      overlaps(cursor, cursor + settings.sessionMinutes, b.start, b.end)
    );

    if (clash) {
      // Resume the moment the obstruction clears rather than losing the whole pitch.
      cursor = clash.end;
      continue;
    }

    slots.push(toTimeString(cursor));
    cursor += pitch;
  }

  return slots;
}

/** Extramurals recur weekly; events land on one specific date. */
function busyIntervalsFor(busy: BusyBlock[], date: Date): { start: number; end: number }[] {
  const day = startOfDay(date);

  return busy
    .filter((block) => {
      if (block.date) return isSameDay(new Date(block.date), day);
      if (block.dayOfWeek != null) return block.dayOfWeek === date.getDay();
      return false;
    })
    .map((block) => ({
      start: toMinutes(block.startTime),
      end: toMinutes(block.endTime),
    }))
    .filter((interval) => interval.end > interval.start)
    .sort((a, b) => a.start - b.start);
}
