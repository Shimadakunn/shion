"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { GuestPicker } from "@/components/reservation/guest-picker";
import { DatePicker } from "@/components/reservation/date-picker";
import { TimeSlotPicker } from "@/components/reservation/time-slot-picker";
import { Button, buttonVariants } from "@/components/ui/button";
import { CalendarDays, ChevronDown, Clock, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [openStep, setOpenStep] = useState<Step>("guests");

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

  const canProceed = guests > 0 && date && timeSelection;

  return (
    <div className="mx-auto min-h-screen max-w-xl px-6 pb-32 pt-24">
      <Link
        href="/"
        className="mb-12 block text-center text-lg font-semibold tracking-[0.3em] uppercase"
      >
        Shion
      </Link>

      <h1 className="mb-12 text-center text-2xl font-light tracking-[0.2em] uppercase">
        {t("title")}
      </h1>

      <div className="space-y-4">
        {/* Step 1: Guests */}
        <AccordionStep
          icon={<UtensilsCrossed className="size-5" />}
          title={t("guests")}
          summary={t("guestsLabel", { count: guests })}
          isOpen={openStep === "guests"}
          onToggle={() => setOpenStep("guests")}
          isCompleted={guests > 0}
        >
          <GuestPicker value={guests} onChange={handleGuestSelect} />
        </AccordionStep>

        {/* Step 2: Date */}
        <AccordionStep
          icon={<CalendarDays className="size-5" />}
          title={date ? formatDateLabel(date, locale) : t("date")}
          summary={date ? formatDateLabel(date, locale) : t("selectDate")}
          isOpen={openStep === "date"}
          onToggle={() => setOpenStep("date")}
          isCompleted={!!date}
        >
          <DatePicker value={date} onChange={handleDateSelect} isDateDisabled={isDateDisabled} />
        </AccordionStep>

        {/* Step 3: Time */}
        <AccordionStep
          icon={<Clock className="size-5" />}
          title={timeSelection ? timeSelection.time : t("time")}
          summary={
            timeSelection
              ? `${timeSelection.service} — ${timeSelection.time}`
              : t("selectTime")
          }
          isOpen={openStep === "time"}
          onToggle={() => setOpenStep("time")}
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
          {date && availability && availability.isOpen && filteredServices.length > 0 && (
            <TimeSlotPicker
              services={filteredServices}
              value={timeSelection}
              onChange={handleTimeSelect}
            />
          )}
        </AccordionStep>
      </div>

      {/* Continue button */}
      {canProceed && (
        <div className="mt-12 text-center">
          <Link
            href={`/reservation/confirm?guests=${guests}&date=${date}&service=${timeSelection.service}&time=${timeSelection.time}`}
            className={buttonVariants({ variant: "default", size: "lg" })}
          >
            {t("next")}
          </Link>
        </div>
      )}
    </div>
  );
}

function AccordionStep({
  icon,
  title,
  summary,
  isOpen,
  onToggle,
  isCompleted,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  summary: string;
  isOpen: boolean;
  onToggle: () => void;
  isCompleted: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border">
      <Button
        variant="ghost"
        onClick={onToggle}
        className="flex h-auto w-full items-center justify-between px-6 py-4"
      >
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-sm font-medium">
            {isCompleted && !isOpen ? summary : title}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "text-muted-foreground h-4 w-4 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </Button>
      {isOpen && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}
