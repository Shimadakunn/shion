"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

type Props = {
  value: string | null;
  onChange: (date: string) => void;
};

function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function DatePicker({ value, onChange }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const firstDay = new Date(viewYear, viewMonth, 1);
  const startDayOfWeek = firstDay.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
  ];
  const dayLabels = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="w-full max-w-sm">
      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="text-muted-foreground hover:text-foreground p-1 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">
          {monthNames[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="text-muted-foreground hover:text-foreground p-1 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {dayLabels.map((d) => (
          <div
            key={d}
            className="text-muted-foreground pb-2 text-center text-xs"
          >
            {d}
          </div>
        ))}

        {/* Day cells */}
        {cells.map((day, i) => {
          if (day === null)
            return <div key={`empty-${i}`} />;

          const dateObj = new Date(viewYear, viewMonth, day);
          const dateStr = formatDateISO(dateObj);
          const isPast = dateObj < today;
          const isSelected = value === dateStr;

          return (
            <button
              key={dateStr}
              disabled={isPast}
              onClick={() => onChange(dateStr)}
              className={cn(
                "flex h-10 items-center justify-center text-sm transition-colors",
                isPast && "text-muted-foreground/30 cursor-not-allowed",
                !isPast && !isSelected && "hover:bg-accent",
                isSelected && "bg-foreground text-background",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
