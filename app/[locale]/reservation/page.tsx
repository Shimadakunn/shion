"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { GuestPicker } from "@/components/reservation/guest-picker";
import { DatePicker } from "@/components/reservation/date-picker";
import { TimeSlotPicker } from "@/components/reservation/time-slot-picker";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "guests" | "date" | "time";

export default function ReservationPage() {
  const t = useTranslations("reservation");

  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState<string | null>(null);
  const [timeSelection, setTimeSelection] = useState<{
    service: string;
    time: string;
  } | null>(null);
  const [openStep, setOpenStep] = useState<Step>("guests");

  const availability = useQuery(
    api.reservations.getAvailableSlots,
    date ? { date } : "skip",
  );

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
          title={t("date")}
          summary={date ?? t("selectDate")}
          isOpen={openStep === "date"}
          onToggle={() => setOpenStep("date")}
          isCompleted={!!date}
        >
          <DatePicker value={date} onChange={handleDateSelect} />
        </AccordionStep>

        {/* Step 3: Time */}
        <AccordionStep
          title={t("time")}
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
            availability.services.length === 0 && (
              <p className="text-muted-foreground text-sm">{t("noSlots")}</p>
            )}
          {date && availability && availability.isOpen && (
            <TimeSlotPicker
              services={availability.services}
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
  title,
  summary,
  isOpen,
  onToggle,
  isCompleted,
  children,
}: {
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
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium tracking-wider uppercase">
            {title}
          </span>
          {!isOpen && isCompleted && (
            <span className="text-muted-foreground text-xs">{summary}</span>
          )}
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
