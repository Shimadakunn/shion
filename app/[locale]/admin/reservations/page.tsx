"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminHeader } from "@/components/admin/admin-header";
import type { Id } from "@/convex/_generated/dataModel";
import type { Reservation, ReservationStatus, ServicePeriod, ViewMode } from "@/components/admin/reservations/types";
import { formatDateISO } from "@/components/admin/reservations/utils";
import { ThreeDayView } from "@/components/admin/reservations/three-day-view";
import { DayView } from "@/components/admin/reservations/day-view";
import { ReservationDetail } from "@/components/admin/reservations/reservation-detail";
import { BlockShiftDialog } from "@/components/admin/reservations/block-shift-dialog";
import { DAY_KEYS, DAY_LABELS } from "@/components/admin/reservations/constants";

function getThreeDayDates(startDate: Date): string[] {
  const dates: string[] = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    dates.push(formatDateISO(d));
  }
  return dates;
}

export default function AdminReservationsPage() {
  const updateStatus = useMutation(api.reservations.updateStatus);
  const sendStatusEmail = useMutation(api.emails.sendStatusUpdateEmail);

  const today = useMemo(() => new Date(), []);
  const todayISO = formatDateISO(today);

  const [view, setView] = useState<ViewMode>("3days");
  const [threeDayStart, setThreeDayStart] = useState(() => new Date(today));
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const threeDayDates = useMemo(() => getThreeDayDates(threeDayStart), [threeDayStart]);

  const queryRange = useMemo(
    () => ({ startDate: threeDayDates[0], endDate: threeDayDates[2] }),
    [threeDayDates],
  );

  const reservations = useQuery(api.reservations.getByDateRange, queryRange);
  const schedule = useQuery(api.schedule.getAll);
  const specialDates = useQuery(api.schedule.getSpecialDates);
  const blockedShiftsRaw = useQuery(api.blocked.getAll);
  const blockedShifts = useMemo(() => blockedShiftsRaw ?? [], [blockedShiftsRaw]);

  const [blockDialogOpen, setBlockDialogOpen] = useState(false);

  const activeDates = threeDayDates;

  const closedDates = useMemo(() => {
    const closed = new Set<string>();
    if (!schedule) return closed;

    const specialMap = new Map<string, boolean>();
    for (const sd of specialDates ?? [])
      specialMap.set(sd.date, sd.isOpen);

    for (const date of activeDates) {
      if (specialMap.has(date)) {
        if (!specialMap.get(date)) closed.add(date);
        continue;
      }
      const dow = new Date(date).getDay();
      const daySchedule = schedule.find((s) => s.dayOfWeek === dow);
      if (!daySchedule || !daySchedule.isOpen || daySchedule.services.length === 0)
        closed.add(date);
    }
    return closed;
  }, [schedule, specialDates, activeDates]);

  const resolveServicesForDate = useCallback(
    (date: string): ServicePeriod[] => {
      if (!schedule) return [];
      const special = (specialDates ?? []).find((sd) => sd.date === date);
      if (special) {
        if (!special.isOpen) return [];
        if (special.services) return special.services;
      }
      const dow = new Date(date).getDay();
      const daySchedule = schedule.find((s) => s.dayOfWeek === dow);
      if (!daySchedule || !daySchedule.isOpen) return [];
      return daySchedule.services;
    },
    [schedule, specialDates],
  );

  const dateServicesMap = useMemo((): Map<string, ServicePeriod[]> => {
    const map = new Map<string, ServicePeriod[]>();
    for (const date of activeDates) map.set(date, resolveServicesForDate(date));
    return map;
  }, [activeDates, resolveServicesForDate]);

  const blockedInfoMap = useMemo(() => {
    const map = new Map<
      string,
      {
        fullyBlocked: boolean;
        windows: { startTime: string; endTime: string; note?: string }[];
      }
    >();
    for (const b of blockedShifts) {
      const key = `${b.date}::${b.service}`;
      const existing = map.get(key) ?? { fullyBlocked: false, windows: [] };
      if (!b.startTime || !b.endTime) existing.fullyBlocked = true;
      else existing.windows.push({
        startTime: b.startTime,
        endTime: b.endTime,
        note: b.note,
      });
      map.set(key, existing);
    }
    return map;
  }, [blockedShifts]);

  const selectedDayServices = useMemo(
    () => dateServicesMap.get(selectedDate) ?? [],
    [dateServicesMap, selectedDate],
  );

  const dayReservations = useMemo(
    () =>
      (reservations ?? [])
        .filter((r) => r.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [reservations, selectedDate],
  );

  function navigateThreeDays(direction: -1 | 1) {
    setThreeDayStart((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + direction * 3);
      return next;
    });
    setSelectedReservation(null);
  }

  function navigateDay(direction: -1 | 1) {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + direction);
      return formatDateISO(d);
    });
    setSelectedReservation(null);
  }

  const goToToday = useCallback(() => {
    setThreeDayStart(new Date(today));
    setSelectedDate(todayISO);
    setSelectedReservation(null);
  }, [today, todayISO]);

  function handleStatusChange(id: Id<"reservations">, status: ReservationStatus) {
    updateStatus({ id, status });

    if (status === "confirmed" || status === "cancelled")
      sendStatusEmail({ reservationId: id, newStatus: status }).catch(() => {});

    if (selectedReservation?._id === id)
      setSelectedReservation((prev) => (prev ? { ...prev, status } : null));
  }

  function navigate(direction: -1 | 1) {
    if (view === "3days") navigateThreeDays(direction);
    else navigateDay(direction);
  }

  const adminHeader = useMemo(
    () => ({
      title: (
        <h1 className="hidden truncate text-sm font-medium tracking-[0.15em] uppercase md:block">
          Reservation management
        </h1>
      ),
      actions: (
        <div className="flex min-w-0 items-center justify-end gap-1.5 md:gap-3">
          <Button variant="outline" size="xs" onClick={goToToday}>
            Today
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={() => setBlockDialogOpen(true)}
          >
            <Lock className="h-3 w-3" />
            Block reservations
          </Button>
          <div className="flex rounded-none border border-border bg-muted">
            {(["3days", "day"] as const).map((v) => (
              <button
                key={v}
                onClick={() => {
                  setView(v);
                  setSelectedReservation(null);
                }}
                className={cn(
                  "px-3 py-1 text-xs transition-colors",
                  view === v
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {v === "3days" ? "3 Days" : "Day"}
              </button>
            ))}
          </div>
        </div>
      ),
    }),
    [view, goToToday],
  );

  useAdminHeader(adminHeader);

  const navDates = view === "3days" ? threeDayDates : [selectedDate];

  return (
    <div className="-m-4 md:-m-8 flex h-[calc(100dvh-3.5rem)] flex-col pb-14 md:pb-0 overflow-hidden">
      {/* Navigation bar — inline day cells aligned with columns below */}
      <div className="relative flex shrink-0 border-b border-border">
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute left-1 top-1/2 z-10 -translate-y-1/2"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {navDates.map((date) => {
          const d = new Date(date);
          const dayLabel = DAY_LABELS[DAY_KEYS[d.getDay()]];
          const dayNum = d.getDate();
          const isToday = date === todayISO;
          const isClosed = closedDates.has(date);
          return (
            <div
              key={date}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-10 py-1.5 border-l border-border first:border-l-0",
                isToday && "bg-primary/[0.06]",
                isClosed && "bg-muted/20",
              )}
            >
              <span className={cn(
                "text-[10px] uppercase tracking-wider",
                isClosed ? "text-muted-foreground/50" : "text-muted-foreground",
              )}>
                {dayLabel}
              </span>
              <span className={cn(
                "flex h-6 w-6 items-center justify-center text-sm",
                isToday && !isClosed && "bg-primary text-primary-foreground rounded-full font-medium",
                isClosed && "text-muted-foreground/50",
              )}>
                {dayNum}
              </span>
              {isClosed && (
                <span className="text-[9px] text-muted-foreground/60 italic">Closed</span>
              )}
            </div>
          );
        })}
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute right-1 top-1/2 z-10 -translate-y-1/2"
          onClick={() => navigate(1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Main content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {view === "3days" && (
          <ThreeDayView
            dates={threeDayDates}
            reservations={(reservations ?? []).filter(
              (r) => r.date >= threeDayDates[0] && r.date <= threeDayDates[2],
            )}
            todayISO={todayISO}
            closedDates={closedDates}
            dateServices={dateServicesMap}
            blockedInfoMap={blockedInfoMap}
            onReservationClick={setSelectedReservation}
          />
        )}
        {view === "day" && (
          <DayView
            reservations={dayReservations}
            isClosed={closedDates.has(selectedDate)}
            services={selectedDayServices}
            isToday={selectedDate === todayISO}
            blockedInfoMap={blockedInfoMap}
            selectedDate={selectedDate}
            onReservationClick={setSelectedReservation}
          />
        )}
      </div>

      <ReservationDetail
        reservation={selectedReservation}
        onStatusChange={handleStatusChange}
        onClose={() => setSelectedReservation(null)}
      />

      <BlockShiftDialog
        open={blockDialogOpen}
        onOpenChange={setBlockDialogOpen}
        getServicesForDate={resolveServicesForDate}
        blockedShifts={blockedShifts}
      />
    </div>
  );
}
