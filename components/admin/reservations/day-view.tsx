"use client";

import { useMemo } from "react";
import { Sun, Moon, X, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Reservation, ServicePeriod } from "./types";
import { isLunchService, getStatusConfig } from "./constants";
import { timeToMinutes } from "./utils";
import { useCurrentMinutes, NowMarker } from "./now-indicator";

type DayViewProps = {
  reservations: Reservation[];
  isClosed: boolean;
  services: ServicePeriod[];
  isToday: boolean;
  onReservationClick: (r: Reservation) => void;
};

type ServiceSection = {
  service: ServicePeriod;
  reservations: Reservation[];
  totalCovers: number;
  pendingCount: number;
};

function ServiceBlock({
  section,
  isToday,
  nowMinutes,
  onReservationClick,
}: {
  section: ServiceSection;
  isToday: boolean;
  nowMinutes: number;
  onReservationClick: (r: Reservation) => void;
}) {
  const isLunch = isLunchService(section.service.name);
  const svcOpen = timeToMinutes(section.service.openTime);
  const svcClose = timeToMinutes(section.service.closeTime);
  const isNowInService = isToday && nowMinutes >= svcOpen && nowMinutes < svcClose;

  let nowInsertIdx = -1;
  if (isNowInService) {
    nowInsertIdx = section.reservations.findIndex(
      (r) => timeToMinutes(r.time) > nowMinutes,
    );
    if (nowInsertIdx === -1) nowInsertIdx = section.reservations.length;
  }

  return (
    <div>
      <div className={cn(
        "flex items-center gap-2 px-4 py-2.5 sticky top-0 z-10 bg-background border-b border-border",
        isNowInService && "bg-red-500/[0.03]",
      )}>
        {isLunch ? (
          <Sun className="h-3.5 w-3.5 text-amber-500 shrink-0" />
        ) : (
          <Moon className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
        )}
        <span className="text-xs font-medium uppercase tracking-wider">
          {section.service.name}
        </span>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {section.service.openTime} – {section.service.closeTime}
        </span>
        <div className="ml-auto flex items-center gap-3">
          {section.pendingCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {section.pendingCount}
            </span>
          )}
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground tabular-nums">
            <Users className="h-3 w-3" />
            {section.totalCovers}/{section.service.maxCovers}
          </span>
        </div>
      </div>

      {section.reservations.length === 0 ? (
        <div className="px-4 py-4 text-center text-xs text-muted-foreground/50">
          {isNowInService && <NowMarker nowMinutes={nowMinutes} />}
          No reservations
        </div>
      ) : (
        <div>
          {section.reservations.map((r, idx) => {
            const config = getStatusConfig(r.status);
            return (
              <div key={r._id}>
                {nowInsertIdx === idx && (
                  <div className="px-4">
                    <NowMarker nowMinutes={nowMinutes} />
                  </div>
                )}
                <button
                  onClick={() => onReservationClick(r)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-muted/40 border-l-2",
                    config.border,
                    config.bg,
                    config.dismissed && "opacity-50",
                  )}
                >
                  <span className={cn(
                    "text-sm tabular-nums font-medium shrink-0 w-11",
                    config.dismissed && "line-through",
                  )}>
                    {r.time}
                  </span>
                  <span className={cn(
                    "text-sm truncate flex-1",
                    config.dismissed && "line-through text-muted-foreground",
                  )}>
                    {r.name}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                    {r.partySize}p
                  </span>
                  <span className={cn("h-2 w-2 rounded-full shrink-0", config.dot)} />
                </button>
              </div>
            );
          })}
          {nowInsertIdx === section.reservations.length && (
            <div className="px-4">
              <NowMarker nowMinutes={nowMinutes} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function DayView({
  reservations,
  isClosed,
  services,
  isToday,
  onReservationClick,
}: DayViewProps) {
  const nowMinutes = useCurrentMinutes();

  const sections = useMemo(() => {
    return services.map((svc) => {
      const svcRes = reservations
        .filter((r) => r.service === svc.name)
        .sort((a, b) => a.time.localeCompare(b.time));
      const active = svcRes.filter((r) => r.status !== "cancelled" && r.status !== "no_show");
      return {
        service: svc,
        reservations: svcRes,
        totalCovers: active.reduce((sum, r) => sum + r.partySize, 0),
        pendingCount: svcRes.filter((r) => r.status === "pending").length,
      };
    });
  }, [services, reservations]);

  const lunchSections = useMemo(
    () => sections.filter((s) => isLunchService(s.service.name)),
    [sections],
  );
  const dinnerSections = useMemo(
    () => sections.filter((s) => !isLunchService(s.service.name)),
    [sections],
  );

  const outsideServicePosition = useMemo(() => {
    if (!isToday || sections.length === 0) return null;
    const inService = sections.some((s) => {
      const open = timeToMinutes(s.service.openTime);
      const close = timeToMinutes(s.service.closeTime);
      return nowMinutes >= open && nowMinutes < close;
    });
    if (inService) return null;
    const allOpens = sections.map((s) => timeToMinutes(s.service.openTime));
    const allCloses = sections.map((s) => timeToMinutes(s.service.closeTime));
    if (nowMinutes < Math.min(...allOpens))
      return lunchSections.length > 0 ? "before-lunch" as const : "before-dinner" as const;
    if (nowMinutes >= Math.max(...allCloses))
      return dinnerSections.length > 0 ? "after-dinner" as const : "after-lunch" as const;
    return "between" as const;
  }, [isToday, sections, lunchSections, dinnerSections, nowMinutes]);

  if (isClosed && reservations.length === 0)
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 border border-destructive/20 bg-destructive/5 px-4 py-2 text-sm text-destructive">
            <X className="h-4 w-4" />
            This day is normally closed
          </div>
          <p className="text-muted-foreground text-sm">No reservations</p>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col divide-y divide-border h-full">
      {isClosed && (
        <div className="shrink-0 flex items-center gap-2 border-b border-destructive/20 bg-destructive/5 px-4 py-2 text-sm text-destructive">
          <X className="h-4 w-4 shrink-0" />
          This day is normally closed
        </div>
      )}

      {/* Lunch half */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {outsideServicePosition === "before-lunch" && (
          <div className="px-4 py-1"><NowMarker nowMinutes={nowMinutes} /></div>
        )}
        {lunchSections.map((section) => (
          <ServiceBlock
            key={section.service.name}
            section={section}
            isToday={isToday}
            nowMinutes={nowMinutes}
            onReservationClick={onReservationClick}
          />
        ))}
        {outsideServicePosition === "after-lunch" && (
          <div className="px-4 py-1"><NowMarker nowMinutes={nowMinutes} /></div>
        )}
      </div>

      {outsideServicePosition === "between" && (
        <div className="shrink-0 px-4">
          <NowMarker nowMinutes={nowMinutes} />
        </div>
      )}

      {/* Dinner half */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {outsideServicePosition === "before-dinner" && (
          <div className="px-4 py-1"><NowMarker nowMinutes={nowMinutes} /></div>
        )}
        {dinnerSections.map((section) => (
          <ServiceBlock
            key={section.service.name}
            section={section}
            isToday={isToday}
            nowMinutes={nowMinutes}
            onReservationClick={onReservationClick}
          />
        ))}
        {outsideServicePosition === "after-dinner" && (
          <div className="px-4 py-1"><NowMarker nowMinutes={nowMinutes} /></div>
        )}
      </div>
    </div>
  );
}
