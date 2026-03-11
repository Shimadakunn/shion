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

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayStr = formatDateISO(today);
  const tomorrowStr = formatDateISO(tomorrow);

  const todayDisabled = isDateDisabled?.(todayStr, today.getDay()) ?? false;
  const tomorrowDisabled = isDateDisabled?.(tomorrowStr, tomorrow.getDay()) ?? false;

  const todayInfo = getShortDayAndDate(today, locale);
  const tomorrowInfo = getShortDayAndDate(tomorrow, locale);

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
        {/* Today */}
        <button
          type="button"
          disabled={todayDisabled}
          onClick={() => handleQuickSelect(todayStr)}
          className={cn(
            "flex flex-col items-center gap-1 rounded-sm border px-3 py-4 transition-colors",
            value === todayStr
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:bg-muted",
            todayDisabled && "pointer-events-none opacity-30",
          )}
        >
          <span className="text-sm font-semibold">
            {todayInfo.day} {todayInfo.date}
          </span>
          <span className="text-xs opacity-70">{t("today")}</span>
        </button>

        {/* Tomorrow */}
        <button
          type="button"
          disabled={tomorrowDisabled}
          onClick={() => handleQuickSelect(tomorrowStr)}
          className={cn(
            "flex flex-col items-center gap-1 rounded-sm border px-3 py-4 transition-colors",
            value === tomorrowStr
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:bg-muted",
            tomorrowDisabled && "pointer-events-none opacity-30",
          )}
        >
          <span className="text-sm font-semibold">
            {tomorrowInfo.day} {tomorrowInfo.date}
          </span>
          <span className="text-xs opacity-70">{t("tomorrow")}</span>
        </button>

        {/* Other */}
        <button
          type="button"
          onClick={() => setShowCalendar(!showCalendar)}
          className={cn(
            "flex flex-col items-center gap-1 rounded-sm border px-3 py-4 transition-colors",
            showCalendar || (value && value !== todayStr && value !== tomorrowStr)
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:bg-muted",
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
                  ? "bg-primary text-primary-foreground"
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
