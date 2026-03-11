"use client";

import { useMemo } from "react";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Reservation, ServicePeriod } from "./types";
import { DAY_KEYS, DAY_LABELS, SLOT_MINUTES } from "./constants";
import { ReservationRow } from "./reservation-row";
import { timeToMinutes, minutesToTime } from "./utils";

const WEEK_SLOT_HEIGHT = 40;

type WeekViewProps = {
  weekDates: string[];
  reservations: Reservation[];
  todayISO: string;
  closedDates: Set<string>;
  weekServices: Map<string, ServicePeriod[]>;
  onDayClick: (date: string) => void;
  onReservationClick: (r: Reservation) => void;
};

export function WeekView({
  weekDates,
  reservations,
  todayISO,
  closedDates,
  weekServices,
  onDayClick,
  onReservationClick,
}: WeekViewProps) {
  const slotBlocks = useMemo(() => {
    const ranges: { start: number; end: number }[] = [];
    for (const services of weekServices.values()) {
      for (const svc of services) {
        const open = timeToMinutes(svc.openTime);
        const close = timeToMinutes(svc.closeTime);
        ranges.push({ start: open - SLOT_MINUTES, end: close + SLOT_MINUTES });
      }
    }
    if (ranges.length === 0)
      return [{ slots: [{ time: "12:00", minutes: 720, isHour: true }] }];

    ranges.sort((a, b) => a.start - b.start);
    const merged: { start: number; end: number }[] = [ranges[0]];
    for (let i = 1; i < ranges.length; i++) {
      const last = merged[merged.length - 1];
      if (ranges[i].start <= last.end)
        last.end = Math.max(last.end, ranges[i].end);
      else merged.push({ ...ranges[i] });
    }

    return merged.map((range) => {
      const startMin = Math.max(
        0,
        Math.floor(range.start / SLOT_MINUTES) * SLOT_MINUTES,
      );
      const endMin = Math.min(
        24 * 60,
        Math.ceil(range.end / SLOT_MINUTES) * SLOT_MINUTES,
      );
      const slots: { time: string; minutes: number; isHour: boolean }[] = [];
      for (let m = startMin; m < endMin; m += SLOT_MINUTES)
        slots.push({
          time: minutesToTime(m),
          minutes: m,
          isHour: m % 60 === 0,
        });
      return { slots };
    });
  }, [weekServices]);

  const reservationsByDateSlot = useMemo(() => {
    const map = new Map<string, Reservation[]>();
    for (const r of reservations) {
      const rMin = timeToMinutes(r.time);
      const slotMin = Math.floor(rMin / SLOT_MINUTES) * SLOT_MINUTES;
      const key = `${r.date}|${minutesToTime(slotMin)}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return map;
  }, [reservations]);

  return (
    <div>
      {/* Sticky day headers */}
      <div className="flex sticky top-0 z-10 bg-background border-b border-border">
        <div className="w-14 shrink-0" />
        {weekDates.map((date) => {
          const d = new Date(date);
          const dayLabel = DAY_LABELS[DAY_KEYS[d.getDay()]];
          const dayNum = d.getDate();
          const isToday = date === todayISO;
          const isClosed = closedDates.has(date);
          const confirmedCount = reservations.filter(
            (r) => r.date === date && r.status === "confirmed",
          ).length;

          return (
            <button
              key={date}
              onClick={() => onDayClick(date)}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 border-l border-border py-2 transition-colors hover:bg-muted/50",
                isClosed && "bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "text-[10px] uppercase tracking-wider",
                  isClosed
                    ? "text-muted-foreground/50"
                    : "text-muted-foreground",
                )}
              >
                {dayLabel}
              </span>
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center text-xs",
                  isToday &&
                    !isClosed &&
                    "bg-primary text-primary-foreground rounded-full font-medium",
                  isClosed && "text-muted-foreground/50",
                )}
              >
                {dayNum}
              </span>
              {isClosed ? (
                <span className="text-[9px] text-muted-foreground/60 italic">
                  Closed
                </span>
              ) : confirmedCount > 0 ? (
                <span className="text-muted-foreground flex items-center gap-0.5 text-[9px]">
                  <Users className="h-2.5 w-2.5" />
                  {confirmedCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="py-1">
        {slotBlocks.map((block, blockIdx) => (
          <div key={blockIdx}>
            {blockIdx > 0 && (
              <div className="flex items-center py-1">
                <div className="w-14 shrink-0" />
                <div className="flex-1 border-t-2 border-dashed border-border/40" />
              </div>
            )}
            {block.slots.map((slot) => (
              <div key={slot.time} className="flex">
                <div
                  className="w-14 shrink-0 relative"
                  style={{ height: WEEK_SLOT_HEIGHT }}
                >
                  {slot.isHour && (
                    <span className="absolute -top-2 right-2 text-[10px] text-muted-foreground tabular-nums">
                      {slot.time}
                    </span>
                  )}
                </div>

                {weekDates.map((date) => {
                  const dayServices = weekServices.get(date) ?? [];
                  const isClosed = closedDates.has(date);
                  const slotEnd = slot.minutes + SLOT_MINUTES;
                  const inService =
                    !isClosed &&
                    dayServices.some((svc) => {
                      const open = timeToMinutes(svc.openTime);
                      const close = timeToMinutes(svc.closeTime);
                      return slot.minutes < close && slotEnd > open;
                    });
                  const cellRes =
                    reservationsByDateSlot.get(`${date}|${slot.time}`) ?? [];

                  return (
                    <div
                      key={date}
                      className={cn(
                        "flex-1 border-l border-l-border px-0.5",
                        slot.isHour
                          ? "border-t border-t-border"
                          : "border-t border-t-border/20",
                        isClosed
                          ? "bg-[repeating-linear-gradient(135deg,transparent,transparent_6px,var(--color-muted)_6px,var(--color-muted)_7px)]"
                          : inService && "bg-primary/[0.03]",
                      )}
                      style={{ minHeight: WEEK_SLOT_HEIGHT }}
                    >
                      {cellRes.map((r) => (
                        <ReservationRow
                          key={r._id}
                          reservation={r}
                          onClick={() => onReservationClick(r)}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
