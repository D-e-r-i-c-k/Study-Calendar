export type ViewMode = "week" | "month" | "day";
export type TimeMode = "condensed" | "timeline";

export interface CalendarState {
  currentDate: Date;
  viewMode: ViewMode;
  timeMode: TimeMode;
}
