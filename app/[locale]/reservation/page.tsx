"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { GuestPicker } from "@/components/reservation/guest-picker";
import { DatePicker } from "@/components/reservation/date-picker";
import { TimeSlotPicker } from "@/components/reservation/time-slot-picker";
import { AccordionStep } from "@/components/reservation/accordion-step";
import { CalendarDays, Clock, UtensilsCrossed } from "lucide-react";

type Step = "guests" | "date" | "time";

const LOCALE_MAP: Record<string, string> = {
  fr: "fr-FR",
  en: "en-US",
  jp: "ja-JP",
};

function formatDateLabel(dateStr: string, locale: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  const intlLocale = LOCALE_MAP[locale] ?? locale;
  return dateObj.toLocaleDateString(intlLocale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function ReservationPage() {
  const t = useTranslations("reservation");
  const locale = useLocale();

  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState<string | null>(null);
  const [timeSelection, setTimeSelection] = useState<{
    service: string;
    time: string;
  } | null>(null);
  const [openStep, setOpenStep] = useState<Step | null>("date");

  const schedule = useQuery(api.schedule.getAll);
  const specialDates = useQuery(api.schedule.getSpecialDates);

  const availability = useQuery(
    api.reservations.getAvailableSlots,
    date ? { date } : "skip",
  );

  const filteredServices = useMemo(() => {
    if (!availability?.isOpen || !availability.services.length) return [];

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    if (date !== todayStr) return availability.services;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return availability.services
      .map((svc) => ({
        ...svc,
        slots: svc.slots.filter((slot) => {
          const [h, m] = slot.time.split(":").map(Number);
          return h * 60 + m > currentMinutes;
        }),
      }))
      .filter((svc) => svc.slots.length > 0);
  }, [availability, date]);

  function isDateDisabled(dateStr: string, dayOfWeek: number): boolean {
    // Special date overrides default schedule
    const special = specialDates?.find((sd) => sd.date === dateStr);
    if (special) return !special.isOpen;

    // Default schedule: closed if no entry, not open, or no services
    const daySched = schedule?.find((s) => s.dayOfWeek === dayOfWeek);
    if (!daySched) return true;
    return !daySched.isOpen || daySched.services.length === 0;
  }

  const initialDateSet = useRef(false);

  useEffect(() => {
    if (initialDateSet.current || !schedule || !specialDates) return;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (let i = 0; i < 60; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${day}`;

      const special = specialDates.find((sd) => sd.date === dateStr);
      if (special) {
        if (special.isOpen) {
          setDate(dateStr);
          setOpenStep("time");
          initialDateSet.current = true;
          return;
        }
        continue;
      }

      const daySched = schedule.find((s) => s.dayOfWeek === d.getDay());
      if (daySched?.isOpen && daySched.services.length > 0) {
        setDate(dateStr);
        setOpenStep("time");
        initialDateSet.current = true;
        return;
      }
    }
  }, [schedule, specialDates]);

  function handleGuestSelect(count: number) {
    setGuests(count);
    setOpenStep("date");
  }

  function handleDateSelect(d: string) {
    setDate(d);
    setTimeSelection(null);
    setOpenStep("time");
  }

  function handleTimeSelect(selection: { service: string; time: string }) {
    setTimeSelection(selection);
  }

  const dateSummary = useMemo(() => {
    if (!date) return "";
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    if (date === todayStr) return t("today");
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
    if (date === tomorrowStr) return t("tomorrow");
    return formatDateLabel(date, locale);
  }, [date, locale, t]);

  const canProceed = guests > 0 && date && timeSelection;

  return (
    <div className="mx-auto flex h-dvh max-w-xl flex-col px-6 py-12">
      {/* Header — pinned top */}
      <div className="shrink-0">
        <Link
          href="/"
          className="mb-2 block text-center text-lg font-bold tracking-widest uppercase"
        >
          Shion
        </Link>
        <h1 className="text-center text-2xl font-light tracking-widest uppercase">
          {t("title")}
        </h1>
      </div>

      {/* Accordion — centered in remaining space */}
      <div className="flex flex-1 items-center">
        <div className="w-full divide-y divide-border overflow-hidden rounded-lg border border-border">
          {/* Step 1: Guests */}
          <AccordionStep
            icon={<UtensilsCrossed className="size-5" />}
            title={t("guests")}
            summary={t("guestsLabel", { count: guests })}
            isOpen={openStep === "guests"}
            onToggle={() =>
              setOpenStep(openStep === "guests" ? null : "guests")
            }
            isCompleted={guests > 0}
          >
            <GuestPicker value={guests} onChange={handleGuestSelect} />
          </AccordionStep>

          {/* Step 2: Date */}
          <AccordionStep
            icon={<CalendarDays className="size-5" />}
            title={date ? dateSummary : t("date")}
            summary={date ? dateSummary : t("selectDate")}
            isOpen={openStep === "date"}
            onToggle={() => setOpenStep(openStep === "date" ? null : "date")}
            isCompleted={!!date}
          >
            <DatePicker
              value={date}
              onChange={handleDateSelect}
              isDateDisabled={isDateDisabled}
            />
          </AccordionStep>

          {/* Step 3: Time */}
          <AccordionStep
            icon={<Clock className="size-5" />}
            title={timeSelection ? timeSelection.time : t("time")}
            summary={timeSelection ? timeSelection.time : t("selectTime")}
            isOpen={openStep === "time"}
            onToggle={() => setOpenStep(openStep === "time" ? null : "time")}
            isCompleted={!!timeSelection}
          >
            {!date && (
              <p className="text-muted-foreground text-sm">{t("selectDate")}</p>
            )}
            {date && availability && !availability.isOpen && (
              <p className="text-muted-foreground text-sm">{t("closed")}</p>
            )}
            {date &&
              availability &&
              availability.isOpen &&
              filteredServices.length === 0 && (
                <p className="text-muted-foreground text-sm">{t("noSlots")}</p>
              )}
            {date &&
              availability &&
              availability.isOpen &&
              filteredServices.length > 0 && (
                <TimeSlotPicker
                  services={filteredServices}
                  value={timeSelection}
                  onChange={handleTimeSelect}
                />
              )}
          </AccordionStep>
        </div>
      </div>

      {/* Footer — pinned bottom */}
      <div className="shrink-0 pt-4">
        {canProceed ? (
          <Link
            href={`/reservation/confirm?guests=${guests}&date=${date}&service=${timeSelection.service}&time=${timeSelection.time}`}
            className="block rounded-lg bg-foreground py-2 text-center font-bold uppercase text-background"
          >
            {t("reserve")}
          </Link>
        ) : (
          <span className="block cursor-not-allowed rounded-lg bg-foreground/30 py-2 text-center font-bold uppercase text-background/50">
            {t("reserve")}
          </span>
        )}
      </div>
    </div>
  );
}

