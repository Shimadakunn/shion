"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import type { Reservation, ReservationStatus, ServicePeriod, ViewMode } from "@/components/admin/reservations/types";
import { formatDateISO } from "@/components/admin/reservations/utils";
import { ThreeDayView } from "@/components/admin/reservations/three-day-view";
import { DayView } from "@/components/admin/reservations/day-view";
import { ReservationDetail } from "@/components/admin/reservations/reservation-detail";

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

  const dateServicesMap = useMemo((): Map<string, ServicePeriod[]> => {
    const map = new Map<string, ServicePeriod[]>();
    if (!schedule) return map;

    for (const date of activeDates) {
      const dow = new Date(date).getDay();
      const special = (specialDates ?? []).find((sd) => sd.date === date);

      if (special) {
        if (!special.isOpen) { map.set(date, []); continue; }
        if (special.services) { map.set(date, special.services); continue; }
      }

      const daySchedule = schedule.find((s) => s.dayOfWeek === dow);
      if (!daySchedule || !daySchedule.isOpen) { map.set(date, []); continue; }
      map.set(date, daySchedule.services);
    }
    return map;
  }, [schedule, specialDates, activeDates]);

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

  function goToToday() {
    setThreeDayStart(new Date(today));
    setSelectedDate(todayISO);
    setSelectedReservation(null);
  }

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

  // Labels
  const threeDayStartDate = new Date(threeDayDates[0]);
  const threeDayEndDate = new Date(threeDayDates[2]);
  const threeDayLabel =
    threeDayStartDate.getMonth() === threeDayEndDate.getMonth()
      ? `${threeDayStartDate.getDate()} – ${threeDayEndDate.getDate()} ${threeDayStartDate.toLocaleDateString("fr-FR", { month: "long" })}`
      : `${threeDayStartDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} – ${threeDayEndDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`;

  const selectedDateObj = new Date(selectedDate);
  const dayLabel = selectedDateObj.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const navLabel = view === "3days" ? threeDayLabel : dayLabel;

  return (
    <div className="-m-4 -mb-20 md:-m-8 md:-mb-8 flex h-dvh flex-col pb-14 md:pb-0 overflow-hidden">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 md:px-6 py-3">
        <h1 className="hidden md:block text-sm font-medium tracking-[0.15em] uppercase">
          Reservation management
        </h1>
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-between md:justify-end">
          <Button variant="outline" size="xs" onClick={goToToday}>
            Today
          </Button>
          <div className="bg-muted flex rounded-none border border-border">
            {(["3days", "day"] as const).map((v) => (
              <button
                key={v}
                onClick={() => { setView(v); setSelectedReservation(null); }}
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
      </div>

      {/* Navigation bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 md:px-6 py-2">
        <Button variant="ghost" size="icon-sm" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium capitalize">{navLabel}</span>
        <Button variant="ghost" size="icon-sm" onClick={() => navigate(1)}>
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
            onReservationClick={setSelectedReservation}
          />
        )}
        {view === "day" && (
          <DayView
            reservations={dayReservations}
            isClosed={closedDates.has(selectedDate)}
            services={selectedDayServices}
            isToday={selectedDate === todayISO}
            onReservationClick={setSelectedReservation}
          />
        )}
      </div>

      <ReservationDetail
        reservation={selectedReservation}
        onStatusChange={handleStatusChange}
        onClose={() => setSelectedReservation(null)}
      />
    </div>
  );
}
