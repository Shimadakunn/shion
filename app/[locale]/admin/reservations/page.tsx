"use client";

import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { CalendarDays, List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

type ViewMode = "list" | "calendar";

function formatToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getWeekDates(baseDate: string): string[] {
  const d = new Date(baseDate);
  const dayOfWeek = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7));

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${day}`);
  }
  return dates;
}

export default function AdminReservationsPage() {
  const t = useTranslations("admin.reservationManager");
  const updateStatus = useMutation(api.reservations.updateStatus);

  const [view, setView] = useState<ViewMode>("list");
  const [selectedDate, setSelectedDate] = useState(formatToday());

  const weekDates = getWeekDates(selectedDate);
  const reservations = useQuery(api.reservations.getByDateRange, {
    startDate: weekDates[0],
    endDate: weekDates[6],
  });

  const dayReservations = reservations?.filter(
    (r) => r.date === selectedDate,
  ) ?? [];

  const statusColors: Record<string, string> = {
    confirmed: "text-green-600",
    cancelled: "text-red-500",
    no_show: "text-orange-500",
    completed: "text-muted-foreground",
  };

  function handleStatusChange(
    id: Id<"reservations">,
    status: "confirmed" | "cancelled" | "no_show" | "completed",
  ) {
    updateStatus({ id, status });
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-light tracking-[0.2em] uppercase">
          {t("title")}
        </h1>
        <div className="flex gap-1">
          <button
            onClick={() => setView("list")}
            className={cn(
              "p-2 transition-colors",
              view === "list" ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("calendar")}
            className={cn(
              "p-2 transition-colors",
              view === "calendar" ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <CalendarDays className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Week navigation */}
      <div className="mb-6 flex gap-1">
        {weekDates.map((date) => {
          const d = new Date(date);
          const dayLabel = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"][d.getDay()];
          const dayNum = d.getDate();
          const count = reservations?.filter((r) => r.date === date && r.status === "confirmed").length ?? 0;

          return (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 border p-3 transition-colors",
                date === selectedDate
                  ? "border-foreground bg-foreground/5"
                  : "border-border hover:border-foreground/30",
              )}
            >
              <span className="text-muted-foreground text-xs">{dayLabel}</span>
              <span className="text-sm font-medium">{dayNum}</span>
              {count > 0 && (
                <span className="text-primary text-xs">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Reservation list */}
      {dayReservations.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          {t("noReservations")}
        </p>
      ) : (
        <div className="space-y-2">
          {dayReservations
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((r) => (
              <div
                key={r._id}
                className="flex items-center justify-between border border-border p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{r.name}</span>
                    <span className={cn("text-xs font-medium uppercase", statusColors[r.status])}>
                      {t(r.status as "confirmed" | "cancelled" | "noShow" | "completed")}
                    </span>
                  </div>
                  <div className="text-muted-foreground flex gap-4 text-sm">
                    <span>{r.time}</span>
                    <span>{r.partySize} {t("partySize").toLowerCase()}</span>
                    <span>{r.phone}</span>
                  </div>
                  {r.notes && (
                    <p className="text-muted-foreground text-xs italic">
                      {r.notes}
                    </p>
                  )}
                </div>
                <select
                  value={r.status}
                  onChange={(e) =>
                    handleStatusChange(
                      r._id,
                      e.target.value as "confirmed" | "cancelled" | "no_show" | "completed",
                    )
                  }
                  className="border-border border bg-transparent px-2 py-1 text-xs"
                >
                  <option value="confirmed">{t("confirmed")}</option>
                  <option value="cancelled">{t("cancelled")}</option>
                  <option value="no_show">{t("noShow")}</option>
                  <option value="completed">{t("completed")}</option>
                </select>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
