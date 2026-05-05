"use client";

import { useMemo } from "react";
import { Sun, Moon, Users, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Reservation, ServicePeriod } from "./types";
import { isLunchService, getStatusConfig } from "./constants";
import { timeToMinutes } from "./utils";
import { useCurrentMinutes, NowMarker } from "./now-indicator";
import { ReservationsClosedState, ReservationsEmptyState } from "./view-states";

export type BlockedInfo = {
  fullyBlocked: boolean;
  windows: { startTime: string; endTime: string; note?: string }[];
};

type ThreeDayViewProps = {
  dates: string[];
  reservations: Reservation[];
  todayISO: string;
  closedDates: Set<string>;
  dateServices: Map<string, ServicePeriod[]>;
  blockedInfoMap: Map<string, BlockedInfo>;
  onReservationClick: (r: Reservation) => void;
};

type ServiceSection = {
  service: ServicePeriod;
  reservations: Reservation[];
  totalCovers: number;
  pendingCount: number;
};

function buildSections(
  date: string,
  services: ServicePeriod[],
  reservations: Reservation[],
): ServiceSection[] {
  const dayRes = reservations.filter((r) => r.date === date);
  return services.map((svc) => {
    const svcRes = dayRes
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
}

function ReservationList({
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

  if (section.reservations.length === 0)
    return (
      <ReservationsEmptyState density="compact">
        {isNowInService && <NowMarker nowMinutes={nowMinutes} />}
      </ReservationsEmptyState>
    );

  return (
    <div>
      {section.reservations.map((r, idx) => {
        const config = getStatusConfig(r.status);
        return (
          <div key={r._id}>
            {nowInsertIdx === idx && (
              <div className="px-1">
                <NowMarker nowMinutes={nowMinutes} />
              </div>
            )}
            <button
              onClick={() => onReservationClick(r)}
              className={cn(
                "w-full flex items-center gap-1 px-2 py-1 text-left transition-colors hover:bg-muted/40 border-l-2",
                config.border,
                config.bg,
                config.dismissed && "opacity-50",
              )}
            >
              <span className={cn(
                "text-[11px] tabular-nums shrink-0",
                config.dismissed && "line-through",
              )}>
                {r.time}
              </span>
              <span className={cn(
                "text-[11px] truncate flex-1",
                config.dismissed && "line-through text-muted-foreground",
              )}>
                {r.name}
              </span>
              <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                {r.partySize}p
              </span>
            </button>
          </div>
        );
      })}
      {nowInsertIdx === section.reservations.length && (
        <div className="px-1">
          <NowMarker nowMinutes={nowMinutes} />
        </div>
      )}
    </div>
  );
}

export function ThreeDayView({
  dates,
  reservations,
  todayISO,
  closedDates,
  dateServices,
  blockedInfoMap,
  onReservationClick,
}: ThreeDayViewProps) {
  const nowMinutes = useCurrentMinutes();

  const sectionsByDate = useMemo(() => {
    const map = new Map<string, ServiceSection[]>();
    for (const date of dates) {
      const services = dateServices.get(date) ?? [];
      map.set(date, buildSections(date, services, reservations));
    }
    return map;
  }, [dates, dateServices, reservations]);

  // Collect unique service names across all dates, split into lunch/dinner
  const outsideServicePosition = useMemo(() => {
    if (!dates.includes(todayISO)) return null;
    const todaySections = sectionsByDate.get(todayISO) ?? [];
    if (todaySections.length === 0) return null;
    const inService = todaySections.some((s) => {
      const open = timeToMinutes(s.service.openTime);
      const close = timeToMinutes(s.service.closeTime);
      return nowMinutes >= open && nowMinutes < close;
    });
    if (inService) return null;
    const allOpens = todaySections.map((s) => timeToMinutes(s.service.openTime));
    const allCloses = todaySections.map((s) => timeToMinutes(s.service.closeTime));
    const hasLunch = todaySections.some((s) => isLunchService(s.service.name));
    const hasDinner = todaySections.some((s) => !isLunchService(s.service.name));
    if (nowMinutes < Math.min(...allOpens))
      return hasLunch ? "before-lunch" as const : "before-dinner" as const;
    if (nowMinutes >= Math.max(...allCloses))
      return hasDinner ? "after-dinner" as const : "after-lunch" as const;
    return "between" as const;
  }, [dates, todayISO, sectionsByDate, nowMinutes]);

  const { lunchServiceNames, dinnerServiceNames } = useMemo(() => {
    const lunch = new Set<string>();
    const dinner = new Set<string>();
    for (const sections of sectionsByDate.values()) {
      for (const s of sections) {
        if (isLunchService(s.service.name)) lunch.add(s.service.name);
        else dinner.add(s.service.name);
      }
    }
    return { lunchServiceNames: [...lunch], dinnerServiceNames: [...dinner] };
  }, [sectionsByDate]);

  // Helper to find section by service name for a given date
  function getSection(date: string, serviceName: string): ServiceSection | undefined {
    return sectionsByDate.get(date)?.find((s) => s.service.name === serviceName);
  }

  const hasServiceRows = lunchServiceNames.length > 0 || dinnerServiceNames.length > 0;
  const lunchRows = lunchServiceNames.length > 0 ? lunchServiceNames : ["lunch"];
  const dinnerRows = dinnerServiceNames.length > 0 ? dinnerServiceNames : ["dinner"];

  if (!hasServiceRows && dates.some((date) => closedDates.has(date)))
    return (
      <div className="flex h-full divide-x divide-border">
        {dates.map((date) => {
          const isClosed = closedDates.has(date);
          const isToday = date === todayISO;
          return (
            <div
              key={date}
              className={cn(
                "flex-1 min-w-0",
                isToday && "bg-primary/[0.06]",
                isClosed && "bg-muted/10",
              )}
            >
              {isClosed && <ReservationsClosedState variant="cell" showEmpty />}
            </div>
          );
        })}
      </div>
    );

  if (!hasServiceRows) return <div className="h-full" />;

  return (
    <div className="flex flex-col h-full">
      {/* Lunch half */}
      <div className="flex-1 min-h-0 flex flex-col">
        {outsideServicePosition === "before-lunch" && (
          <div className="shrink-0 flex divide-x divide-border">
            {dates.map((date) => (
              <div key={date} className="flex-1">
                {date === todayISO && (
                  <div className="px-1"><NowMarker nowMinutes={nowMinutes} /></div>
                )}
              </div>
            ))}
          </div>
        )}
        {lunchRows.map((serviceName) => (
          <div key={serviceName} className="flex flex-col flex-1 min-h-0">
            {/* Service header row with covers per day */}
            <div className="flex shrink-0 border-b border-border bg-muted/30">
              {dates.map((date, i) => {
                const section = getSection(date, serviceName);
                const isClosed = closedDates.has(date);
                const isToday = date === todayISO;
                const blocked = blockedInfoMap.get(`${date}::${serviceName}`);
                const isFully = blocked?.fullyBlocked;
                const isShiftClosed = !isClosed && !section;
                return (
                  <div
                    key={date}
                    className={cn(
                      "flex-1 flex items-center gap-1 px-2 py-1",
                      i > 0 && "border-l border-border",
                      isToday && "bg-primary/[0.06]",
                      isClosed && "bg-muted/20",
                      isShiftClosed && "bg-muted/10",
                    )}
                  >
                    {i === 0 && (
                      <>
                        <Sun className="h-3 w-3 text-amber-500 shrink-0" />
                        <span className="text-[10px] font-medium uppercase tracking-wider truncate">
                          {serviceName}
                        </span>
                      </>
                    )}
                    {!isClosed && section && (
                      <span className={cn(
                        "text-[9px] text-muted-foreground tabular-nums shrink-0 flex items-center gap-1",
                        i > 0 && "ml-auto",
                        i === 0 && "ml-auto",
                      )}>
                        {blocked && (
                          <Lock className={cn(
                            "h-2.5 w-2.5",
                            isFully ? "text-destructive" : "text-amber-500",
                          )} />
                        )}
                        <span>
                          <Users className="h-2.5 w-2.5 inline mr-0.5" />
                          {section.totalCovers}
                        </span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Reservation columns */}
            <div className="flex flex-1 min-h-0 divide-x divide-border">
              {dates.map((date) => {
                const section = getSection(date, serviceName);
                const isClosed = closedDates.has(date);
                const isToday = date === todayISO;
                const blocked = blockedInfoMap.get(`${date}::${serviceName}`);
                const isFully = blocked?.fullyBlocked;
                const isShiftClosed = !isClosed && !section;
                return (
                  <div
                    key={date}
                    className={cn(
                      "flex-1 min-w-0 overflow-y-auto",
                      isToday && "bg-primary/[0.06]",
                      isClosed && "bg-muted/10",
                      isShiftClosed && "bg-muted/10",
                      !isClosed && isFully && "bg-destructive/5",
                    )}
                  >
                    {isClosed ? (
                      <ReservationsClosedState variant="cell" showEmpty />
                    ) : isShiftClosed ? (
                      <ReservationsClosedState variant="cell" scope="shift" showEmpty />
                    ) : (
                      <>
                        {isFully && (
                          <div className="px-2 py-1 text-[9px] font-medium uppercase tracking-wider text-destructive flex items-center gap-1 border-b border-destructive/10">
                            <Lock className="h-2.5 w-2.5" />
                            Reservations blocked
                          </div>
                        )}
                        {!isFully && blocked && blocked.windows.length > 0 && (
                          <div className="px-2 py-0.5 text-[9px] text-amber-600 dark:text-amber-400 border-b border-amber-500/20">
                            <Lock className="h-2.5 w-2.5 inline mr-0.5" />
                            {blocked.windows.map((w) => `${w.startTime}–${w.endTime}`).join(", ")}
                          </div>
                        )}
                        {section && (
                          <ReservationList
                            section={section}
                            isToday={isToday}
                            nowMinutes={nowMinutes}
                            onReservationClick={onReservationClick}
                          />
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {outsideServicePosition === "after-lunch" && (
          <div className="shrink-0 flex divide-x divide-border">
            {dates.map((date) => (
              <div key={date} className="flex-1">
                {date === todayISO && (
                  <div className="px-1"><NowMarker nowMinutes={nowMinutes} /></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className={cn("shrink-0 border-t border-border", outsideServicePosition === "between" && "flex divide-x divide-border")}>
        {outsideServicePosition === "between" && dates.map((date) => (
          <div key={date} className="flex-1">
            {date === todayISO && (
              <div className="px-1"><NowMarker nowMinutes={nowMinutes} /></div>
            )}
          </div>
        ))}
      </div>

      {/* Dinner half */}
      <div className="flex-1 min-h-0 flex flex-col">
        {outsideServicePosition === "before-dinner" && (
          <div className="shrink-0 flex divide-x divide-border">
            {dates.map((date) => (
              <div key={date} className="flex-1">
                {date === todayISO && (
                  <div className="px-1"><NowMarker nowMinutes={nowMinutes} /></div>
                )}
              </div>
            ))}
          </div>
        )}
        {dinnerRows.map((serviceName) => (
          <div key={serviceName} className="flex flex-col flex-1 min-h-0">
            {/* Service header row with covers per day */}
            <div className="flex shrink-0 border-b border-border bg-muted/30">
              {dates.map((date, i) => {
                const section = getSection(date, serviceName);
                const isClosed = closedDates.has(date);
                const isToday = date === todayISO;
                const blocked = blockedInfoMap.get(`${date}::${serviceName}`);
                const isFully = blocked?.fullyBlocked;
                const isShiftClosed = !isClosed && !section;
                return (
                  <div
                    key={date}
                    className={cn(
                      "flex-1 flex items-center gap-1 px-2 py-1",
                      i > 0 && "border-l border-border",
                      isToday && "bg-primary/[0.06]",
                      isClosed && "bg-muted/20",
                      isShiftClosed && "bg-muted/10",
                    )}
                  >
                    {i === 0 && (
                      <>
                        <Moon className="h-3 w-3 text-indigo-400 shrink-0" />
                        <span className="text-[10px] font-medium uppercase tracking-wider truncate">
                          {serviceName}
                        </span>
                      </>
                    )}
                    {!isClosed && section && (
                      <span className={cn(
                        "text-[9px] text-muted-foreground tabular-nums shrink-0 ml-auto flex items-center gap-1",
                      )}>
                        {blocked && (
                          <Lock className={cn(
                            "h-2.5 w-2.5",
                            isFully ? "text-destructive" : "text-amber-500",
                          )} />
                        )}
                        <span>
                          <Users className="h-2.5 w-2.5 inline mr-0.5" />
                          {section.totalCovers}
                        </span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Reservation columns */}
            <div className="flex flex-1 min-h-0 divide-x divide-border">
              {dates.map((date) => {
                const section = getSection(date, serviceName);
                const isClosed = closedDates.has(date);
                const isToday = date === todayISO;
                const blocked = blockedInfoMap.get(`${date}::${serviceName}`);
                const isFully = blocked?.fullyBlocked;
                const isShiftClosed = !isClosed && !section;
                return (
                  <div
                    key={date}
                    className={cn(
                      "flex-1 min-w-0 overflow-y-auto",
                      isToday && "bg-primary/[0.06]",
                      isClosed && "bg-muted/10",
                      isShiftClosed && "bg-muted/10",
                      !isClosed && isFully && "bg-destructive/5",
                    )}
                  >
                    {isClosed ? (
                      <ReservationsClosedState variant="cell" showEmpty />
                    ) : isShiftClosed ? (
                      <ReservationsClosedState variant="cell" scope="shift" showEmpty />
                    ) : (
                      <>
                        {isFully && (
                          <div className="px-2 py-1 text-[9px] font-medium uppercase tracking-wider text-destructive flex items-center gap-1 border-b border-destructive/10">
                            <Lock className="h-2.5 w-2.5" />
                            Reservations blocked
                          </div>
                        )}
                        {!isFully && blocked && blocked.windows.length > 0 && (
                          <div className="px-2 py-0.5 text-[9px] text-amber-600 dark:text-amber-400 border-b border-amber-500/20">
                            <Lock className="h-2.5 w-2.5 inline mr-0.5" />
                            {blocked.windows.map((w) => `${w.startTime}–${w.endTime}`).join(", ")}
                          </div>
                        )}
                        {section && (
                          <ReservationList
                            section={section}
                            isToday={isToday}
                            nowMinutes={nowMinutes}
                            onReservationClick={onReservationClick}
                          />
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {outsideServicePosition === "after-dinner" && (
          <div className="shrink-0 flex divide-x divide-border">
            {dates.map((date) => (
              <div key={date} className="flex-1">
                {date === todayISO && (
                  <div className="px-1"><NowMarker nowMinutes={nowMinutes} /></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
