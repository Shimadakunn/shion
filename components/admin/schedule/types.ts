export type ServiceInput = {
  name: string;
  openTime: string;
  closeTime: string;
  maxCovers: number;
};

export const TIME_SLOTS = Array.from({ length: 31 }, (_, i) => {
  const totalMinutes = 9 * 60 + i * 30;
  const h = String(Math.floor(totalMinutes / 60) % 24).padStart(2, "0");
  const m = totalMinutes % 60 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

export const DAY_LABELS: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export const DEFAULT_SERVICES: ServiceInput[] = [
  { name: "lunch", openTime: "12:00", closeTime: "14:00", maxCovers: 30 },
  { name: "dinner", openTime: "19:00", closeTime: "22:00", maxCovers: 30 },
];
