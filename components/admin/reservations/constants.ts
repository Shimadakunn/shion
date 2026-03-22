import type { ReservationStatus } from "./types";

export type StatusStyle = {
  label: string;
  dot: string;
  border: string;
  bg: string;
  text: string;
  dismissed: boolean;
};

const FALLBACK_STATUS: StatusStyle = {
  label: "Unknown",
  dot: "bg-zinc-400",
  border: "border-l-zinc-400",
  bg: "",
  text: "text-muted-foreground",
  dismissed: false,
};

export function getStatusConfig(status: string): StatusStyle {
  return STATUS_CONFIG[status as ReservationStatus] ?? FALLBACK_STATUS;
}

export const STATUS_CONFIG: Record<ReservationStatus, StatusStyle> = {
  pending: {
    label: "Pending",
    dot: "bg-amber-500",
    border: "border-l-amber-500",
    bg: "bg-amber-500/8",
    text: "text-amber-700 dark:text-amber-400",
    dismissed: false,
  },
  confirmed: {
    label: "Confirmed",
    dot: "bg-emerald-500",
    border: "border-l-emerald-500",
    bg: "bg-emerald-500/5",
    text: "text-emerald-700 dark:text-emerald-400",
    dismissed: false,
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-red-400",
    border: "border-l-red-400",
    bg: "",
    text: "text-muted-foreground",
    dismissed: true,
  },
  no_show: {
    label: "No-show",
    dot: "bg-orange-400",
    border: "border-l-orange-400",
    bg: "",
    text: "text-muted-foreground",
    dismissed: true,
  },
  completed: {
    label: "Completed",
    dot: "bg-zinc-400",
    border: "border-l-zinc-400",
    bg: "",
    text: "text-muted-foreground",
    dismissed: false,
  },
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

export const SLOT_MINUTES = 30;

const LUNCH_KEYWORDS = ["lunch", "midi", "déjeuner", "ランチ", "昼"];

export function isLunchService(service: string): boolean {
  const lower = service.toLowerCase();
  return LUNCH_KEYWORDS.some((kw) => lower.includes(kw));
}
