"use client";

import { useMemo } from "react";
import { Sun, Moon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Reservation, ServicePeriod } from "./types";
import { SLOT_MINUTES, isLunchService } from "./constants";
import { ReservationRow } from "./reservation-row";
import { timeToMinutes, minutesToTime } from "./utils";

const SLOT_HEIGHT = 60;

type DayViewProps = {
  reservations: Reservation[];
  isClosed: boolean;
  services: ServicePeriod[];
  onReservationClick: (r: Reservation) => void;
};

export function DayView({
  reservations,
  isClosed,
  services,
  onReservationClick,
}: DayViewProps) {
  const slotBlocks = useMemo(() => {
    if (services.length === 0)
      return [{ slots: [{ time: "12:00", minutes: 720, isHour: true }] }];

    const ranges: { start: number; end: number }[] = services.map((svc) => ({
      start: timeToMinutes(svc.openTime) - SLOT_MINUTES,
      end: timeToMinutes(svc.closeTime) + SLOT_MINUTES,
    }));
    ranges.sort((a, b) => a.start - b.start);

    const merged: { start: number; end: number }[] = [ranges[0]];
    for (let i = 1; i < ranges.length; i++) {
      const last = merged[merged.length - 1];
      if (ranges[i].start <= last.end)
        last.end = Math.max(last.end, ranges[i].end);
      else
        merged.push({ ...ranges[i] });
    }

    return merged.map((range) => {
      const startMin = Math.max(0, Math.floor(range.start / SLOT_MINUTES) * SLOT_MINUTES);
      const endMin = Math.min(24 * 60, Math.ceil(range.end / SLOT_MINUTES) * SLOT_MINUTES);
      const slots: { time: string; minutes: number; isHour: boolean }[] = [];
      for (let m = startMin; m < endMin; m += SLOT_MINUTES)
        slots.push({ time: minutesToTime(m), minutes: m, isHour: m % 60 === 0 });
      return { slots };
    });
  }, [services]);

  const reservationsBySlot = useMemo(() => {
    const map = new Map<string, Reservation[]>();
    for (const r of reservations) {
      const rMin = timeToMinutes(r.time);
      const slotMin = Math.floor(rMin / SLOT_MINUTES) * SLOT_MINUTES;
      const key = minutesToTime(slotMin);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return map;
  }, [reservations]);

  const serviceStats = useMemo(() => {
    const stats = new Map<string, { count: number; covers: number }>();
    for (const r of reservations) {
      if (r.status !== "confirmed") continue;
      const cur = stats.get(r.service) ?? { count: 0, covers: 0 };
      stats.set(r.service, { count: cur.count + 1, covers: cur.covers + r.partySize });
    }
    return stats;
  }, [reservations]);

  const isSlotInService = (slotMinutes: number): boolean => {
    const slotEnd = slotMinutes + SLOT_MINUTES;
    return services.some((svc) => {
      const open = timeToMinutes(svc.openTime);
      const close = timeToMinutes(svc.closeTime);
      return slotMinutes < close && slotEnd > open;
    });
  };

  const blockServices = useMemo(() => {
    return slotBlocks.map((block) => {
      const blockStart = block.slots[0].minutes;
      const blockEnd = block.slots[block.slots.length - 1].minutes + SLOT_MINUTES;
      return services.filter((svc) => {
        const open = timeToMinutes(svc.openTime);
        return open >= blockStart && open < blockEnd;
      });
    });
  }, [slotBlocks, services]);

  if (isClosed && reservations.length === 0)
    return (
      <div className="py-24 text-center">
        <div className="mb-4 inline-flex items-center gap-2 border border-destructive/20 bg-destructive/5 px-4 py-2 text-sm text-destructive">
          <X className="h-4 w-4" />
          This day is normally closed
        </div>
        <p className="text-muted-foreground text-sm">No reservations</p>
      </div>
    );

  return (
    <div>
      {isClosed && (
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-destructive/20 bg-destructive/5 px-6 py-2 text-sm text-destructive">
          <X className="h-4 w-4 shrink-0" />
          This day is normally closed
        </div>
      )}

      <div className="py-2">
        {slotBlocks.map((block, blockIdx) => (
          <div key={blockIdx}>
            {blockIdx > 0 && (
              <div className="flex items-center py-2">
                <div className="w-16 shrink-0" />
                <div className="flex-1 border-t-2 border-dashed border-border/40" />
              </div>
            )}

            {/* Service headers above the time grid */}
            {blockServices[blockIdx]?.map((svc) => {
              const stats = serviceStats.get(svc.name);
              return (
                <div key={svc.name} className="flex items-center gap-2 px-3 py-1.5">
                  {isLunchService(svc.name) ? (
                    <Sun className="h-3.5 w-3.5 text-amber-500" />
                  ) : (
                    <Moon className="h-3.5 w-3.5 text-indigo-400" />
                  )}
                  <span className="text-xs font-medium uppercase tracking-wider">
                    {svc.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {svc.openTime} – {svc.closeTime}
                  </span>
                  {stats && (
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {stats.count} reservations · {stats.covers} covers
                    </span>
                  )}
                </div>
              );
            })}

            {block.slots.map((slot) => {
              const inService = isSlotInService(slot.minutes);
              const slotRes = reservationsBySlot.get(slot.time) ?? [];

              return (
                <div key={slot.time} className="flex">
                  <div className="w-16 shrink-0 relative" style={{ height: SLOT_HEIGHT }}>
                    {slot.isHour && (
                      <span className="absolute -top-2.5 right-3 text-[11px] text-muted-foreground tabular-nums font-medium">
                        {slot.time}
                      </span>
                    )}
                  </div>

                  <div
                    className={cn(
                      "flex-1 border-l px-3 py-0.5 flex flex-wrap items-start gap-1",
                      slot.isHour ? "border-t border-t-border" : "border-t border-t-border/20",
                      inService
                        ? "border-l-primary/30 bg-primary/[0.03]"
                        : "border-l-border",
                    )}
                    style={{ minHeight: SLOT_HEIGHT }}
                  >
                    {slotRes.map((r) => (
                      <ReservationRow
                        key={r._id}
                        reservation={r}
                        onClick={() => onReservationClick(r)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
