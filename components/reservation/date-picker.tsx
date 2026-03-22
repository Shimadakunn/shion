"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

type Props = {
  value: string | null;
  onChange: (date: string) => void;
  isDateDisabled?: (dateStr: string, dayOfWeek: number) => boolean;
};

const LOCALE_MAP: Record<string, string> = {
  fr: "fr-FR",
  en: "en-US",
  jp: "ja-JP",
};

function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getShortDayAndDate(date: Date, locale: string): { day: string; date: number } {
  const intlLocale = LOCALE_MAP[locale] ?? locale;
  const dayName = date.toLocaleDateString(intlLocale, { weekday: "short" });
  return { day: dayName, date: date.getDate() };
}

export function DatePicker({ value, onChange, isDateDisabled }: Props) {
  const t = useTranslations("reservation");
  const locale = useLocale();
  const [showCalendar, setShowCalendar] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find next 2 open days for quick-select (skip closed days entirely)
  const quickDates: { dateStr: string; label: string; sublabel: string }[] = [];
  for (let i = 0; i < 30 && quickDates.length < 2; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = formatDateISO(d);
    if (isDateDisabled?.(dateStr, d.getDay())) continue;

    const info = getShortDayAndDate(d, locale);
    let sublabel = "";
    if (i === 0) sublabel = t("today");
    else if (i === 1) sublabel = t("tomorrow");

    quickDates.push({
      dateStr,
      label: `${info.day} ${info.date}`,
      sublabel,
    });
  }

  function handleQuickSelect(dateStr: string) {
    setShowCalendar(false);
    onChange(dateStr);
  }

  function handleCalendarSelect(dateStr: string) {
    setShowCalendar(false);
    onChange(dateStr);
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-center text-xs tracking-wider uppercase">
        {t("nextAvailability")}
      </p>

      <div className="grid grid-cols-3 gap-3">
        {quickDates.map((qd) => (
          <button
            key={qd.dateStr}
            type="button"
            onClick={() => handleQuickSelect(qd.dateStr)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg border px-3 py-4 transition-colors",
              value === qd.dateStr && !showCalendar
                ? "border-foreground bg-foreground text-background"
                : "border-border",
            )}
          >
            <span className="text-sm font-semibold">{qd.label}</span>
            {qd.sublabel && (
              <span className="text-xs opacity-70">{qd.sublabel}</span>
            )}
          </button>
        ))}

        {/* Other */}
        <button
          type="button"
          onClick={() => setShowCalendar(!showCalendar)}
          className={cn(
            "flex flex-col items-center gap-1 rounded-lg border px-3 py-4 transition-colors",
            showCalendar ||
              (value && !quickDates.some((qd) => qd.dateStr === value))
              ? "border-foreground bg-foreground text-background"
              : "border-border",
          )}
        >
          <CalendarDays className="size-5" />
          <span className="text-xs opacity-70">{t("other")}</span>
        </button>
      </div>

      {/* Calendar (shown when "Other" is clicked) */}
      {showCalendar && (
        <MiniCalendar
          value={value}
          onChange={handleCalendarSelect}
          isDateDisabled={isDateDisabled}
          locale={locale}
        />
      )}
    </div>
  );
}

/* ─── Mini calendar (extracted from previous full calendar) ─── */

function MiniCalendar({
  value,
  onChange,
  isDateDisabled,
  locale,
}: {
  value: string | null;
  onChange: (date: string) => void;
  isDateDisabled?: (dateStr: string, dayOfWeek: number) => boolean;
  locale: string;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const intlLocale = LOCALE_MAP[locale] ?? locale;

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString(intlLocale, {
    month: "long",
    year: "numeric",
  });

  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2024, 0, i + 1); // Jan 1 2024 is Monday
    return d.toLocaleDateString(intlLocale, { weekday: "narrow" });
  });

  const firstDay = new Date(viewYear, viewMonth, 1);
  const startDayOfWeek = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

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
    <div className="w-full">
      {/* Month navigation */}
      <div className="mb-3 flex items-center justify-between">
        <Button variant="ghost" size="icon-sm" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium capitalize">{monthLabel}</span>
        <Button variant="ghost" size="icon-sm" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {dayLabels.map((d, i) => (
          <div
            key={i}
            className="text-muted-foreground pb-2 text-center text-xs uppercase"
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
          const isClosed = isDateDisabled?.(dateStr, dateObj.getDay()) ?? false;
          const disabled = isPast || isClosed;
          const isSelected = value === dateStr;
          const isToday = dateStr === formatDateISO(today);

          return (
            <button
              key={dateStr}
              type="button"
              disabled={disabled}
              onClick={() => onChange(dateStr)}
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-sm transition-colors",
                isSelected
                  ? "bg-foreground text-background font-semibold"
                  : isToday
                    ? "border border-border font-semibold"
                    : "hover:bg-muted",
                disabled && "pointer-events-none opacity-20",
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
