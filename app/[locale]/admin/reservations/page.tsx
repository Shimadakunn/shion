"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import type { Reservation, ReservationStatus, ServicePeriod, ViewMode } from "@/components/admin/reservations/types";
import { formatDateISO, getMonday, getWeekDates } from "@/components/admin/reservations/utils";
import { WeekView } from "@/components/admin/reservations/week-view";
import { DayView } from "@/components/admin/reservations/day-view";
import { ReservationDetail } from "@/components/admin/reservations/reservation-detail";

export default function AdminReservationsPage() {
  const updateStatus = useMutation(api.reservations.updateStatus);
  const sendStatusEmail = useAction(api.emails.sendStatusUpdateEmail);

  const today = useMemo(() => new Date(), []);
  const todayISO = formatDateISO(today);

  const [view, setView] = useState<ViewMode>("week");
  const [weekStart, setWeekStart] = useState(() => getMonday(today));
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  const reservations = useQuery(api.reservations.getByDateRange, {
    startDate: weekDates[0],
    endDate: weekDates[6],
  });

  const schedule = useQuery(api.schedule.getAll);
  const specialDates = useQuery(api.schedule.getSpecialDates);

  const closedDates = useMemo(() => {
    const closed = new Set<string>();
    if (!schedule) return closed;

    const specialMap = new Map<string, boolean>();
    for (const sd of specialDates ?? [])
      specialMap.set(sd.date, sd.isOpen);

    for (const date of weekDates) {
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
  }, [schedule, specialDates, weekDates]);

  const weekServices = useMemo((): Map<string, ServicePeriod[]> => {
    const map = new Map<string, ServicePeriod[]>();
    if (!schedule) return map;

    for (const date of weekDates) {
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
  }, [schedule, specialDates, weekDates]);

  const selectedDayServices = useMemo(
    () => weekServices.get(selectedDate) ?? [],
    [weekServices, selectedDate],
  );

  const dayReservations = useMemo(
    () =>
      (reservations ?? [])
        .filter((r) => r.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [reservations, selectedDate],
  );

  function navigateWeek(direction: -1 | 1) {
    setWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + direction * 7);
      return next;
    });
    setSelectedReservation(null);
  }

  function navigateDay(direction: -1 | 1) {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + direction);
      const newMonday = getMonday(d);
      if (newMonday.getTime() !== weekStart.getTime())
        setWeekStart(newMonday);
      return formatDateISO(d);
    });
    setSelectedReservation(null);
  }

  function goToToday() {
    setWeekStart(getMonday(today));
    setSelectedDate(todayISO);
    setSelectedReservation(null);
  }

  function handleStatusChange(id: Id<"reservations">, status: ReservationStatus) {
    updateStatus({ id, status });

    // Send email notification for confirmed/cancelled status changes
    if (status === "confirmed" || status === "cancelled")
      sendStatusEmail({ reservationId: id, newStatus: status }).catch(() => {});

    if (selectedReservation?._id === id)
      setSelectedReservation((prev) => (prev ? { ...prev, status } : null));
  }

  function handleDayClick(date: string) {
    setSelectedDate(date);
    setView("day");
    setSelectedReservation(null);
  }

  // Month label
  const weekStartDate = new Date(weekDates[0]);
  const weekEndDate = new Date(weekDates[6]);
  const monthLabel =
    weekStartDate.getMonth() === weekEndDate.getMonth()
      ? weekStartDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
      : `${weekStartDate.toLocaleDateString("fr-FR", { month: "short" })} – ${weekEndDate.toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}`;

  const selectedDateObj = new Date(selectedDate);
  const dayLabel = selectedDateObj.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="-m-4 md:-m-8 flex h-[calc(100vh)] flex-col pb-16 md:pb-0">
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
            <button
              onClick={() => { setView("week"); setSelectedReservation(null); }}
              className={cn(
                "px-3 py-1 text-xs transition-colors",
                view === "week"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Week
            </button>
            <button
              onClick={() => { setView("day"); setSelectedReservation(null); }}
              className={cn(
                "px-3 py-1 text-xs transition-colors",
                view === "day"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Day
            </button>
          </div>
        </div>
      </div>

      {/* Navigation bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 md:px-6 py-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => (view === "week" ? navigateWeek(-1) : navigateDay(-1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium capitalize">
          {view === "week" ? monthLabel : dayLabel}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => (view === "week" ? navigateWeek(1) : navigateDay(1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Main content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {view === "week" ? (
          <WeekView
            weekDates={weekDates}
            reservations={reservations ?? []}
            todayISO={todayISO}
            closedDates={closedDates}
            weekServices={weekServices}
            onDayClick={handleDayClick}
            onReservationClick={setSelectedReservation}
          />
        ) : (
          <DayView
            reservations={dayReservations}
            isClosed={closedDates.has(selectedDate)}
            services={selectedDayServices}
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
