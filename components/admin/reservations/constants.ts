export const STATUS_CONFIG = {
  pending: { variant: "outline" as const, dot: "bg-amber-500" },
  confirmed: { variant: "default" as const, dot: "bg-emerald-500" },
  cancelled: { variant: "destructive" as const, dot: "bg-red-500" },
  no_show: { variant: "destructive" as const, dot: "bg-orange-500" },
  completed: { variant: "secondary" as const, dot: "bg-zinc-400" },
};

export const DAY_KEYS = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
] as const;

export const DAY_LABELS: Record<string, string> = {
  sun: "Sun",
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
};

export const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  noShow: "No-show",
  completed: "Completed",
};

export const SLOT_MINUTES = 30;

const LUNCH_KEYWORDS = ["lunch", "midi", "déjeuner", "ランチ", "昼"];

export function isLunchService(service: string): boolean {
  const lower = service.toLowerCase();
  return LUNCH_KEYWORDS.some((kw) => lower.includes(kw));
}
