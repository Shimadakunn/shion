"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { GuestPicker } from "@/components/reservation/guest-picker";
import { DatePicker } from "@/components/reservation/date-picker";
import { TimeSlotPicker } from "@/components/reservation/time-slot-picker";
import { AccordionStep } from "@/components/reservation/accordion-step";
import {
  CalendarDays,
  Clock,
  MessageSquare,
  SquarePen,
  UtensilsCrossed,
} from "lucide-react";

type StatusKey =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";
type ModifyStep = "guests" | "date" | "time";

const STATUS_STYLES: Record<
  StatusKey,
  { bg: string; text: string; dot: string }
> = {
  pending: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    dot: "bg-amber-500",
  },
  confirmed: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "bg-emerald-500",
  },
  cancelled: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
  completed: {
    bg: "bg-zinc-500/10",
    text: "text-zinc-400",
    dot: "bg-zinc-400",
  },
  no_show: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    dot: "bg-orange-400",
  },
};

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

function getDateLabel(
  dateStr: string,
  locale: string,
  tRes: (key: string) => string,
): string {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (dateStr === todayStr) return tRes("today");
  const tmrw = new Date(now);
  tmrw.setDate(tmrw.getDate() + 1);
  const tmrwStr = `${tmrw.getFullYear()}-${String(tmrw.getMonth() + 1).padStart(2, "0")}-${String(tmrw.getDate()).padStart(2, "0")}`;
  if (dateStr === tmrwStr) return tRes("tomorrow");
  return formatDateLabel(dateStr, locale);
}

export default function ManageReservationPage() {
  const t = useTranslations("manage");
  const tRes = useTranslations("reservation");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const reservation = useQuery(
    api.reservations.getByToken,
    token ? { token } : "skip",
  );
  const schedule = useQuery(api.schedule.getAll);
  const specialDates = useQuery(api.schedule.getSpecialDates);
  const cancelByToken = useMutation(api.reservations.cancelByToken);
  const requestModification = useMutation(
    api.reservations.requestModificationByToken,
  );
  const sendCancelNotif = useMutation(
    api.emails.sendCancellationNotificationToAdmin,
  );
  const sendModifNotif = useMutation(
    api.emails.sendModificationNotificationToAdmin,
  );
  const sendModifConfirm = useMutation(
    api.emails.sendModificationConfirmationToCustomer,
  );

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showModifyConfirm, setShowModifyConfirm] = useState(false);
  const [showModifyForm, setShowModifyForm] = useState(false);
  const [actionDone, setActionDone] = useState<"cancelled" | "modified" | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  // Modify form state
  const [modDate, setModDate] = useState<string | null>(null);
  const [modTime, setModTime] = useState<{
    service: string;
    time: string;
  } | null>(null);
  const [modGuests, setModGuests] = useState(2);
  const [modStep, setModStep] = useState<ModifyStep | null>("time");

  // Load available slots for the selected modification date
  const slotsData = useQuery(
    api.reservations.getAvailableSlots,
    modDate ? { date: modDate } : "skip",
  );

  const filteredServices = useMemo(() => {
    if (!slotsData?.isOpen || !slotsData.services.length) return [];
    return slotsData.services;
  }, [slotsData]);

  function isDateDisabled(dateStr: string, dayOfWeek: number): boolean {
    const special = specialDates?.find((sd) => sd.date === dateStr);
    if (special) return !special.isOpen;
    const daySched = schedule?.find((s) => s.dayOfWeek === dayOfWeek);
    if (!daySched) return true;
    return !daySched.isOpen || daySched.services.length === 0;
  }

  // Initialize modify form when reservation first loads
  const [initialized, setInitialized] = useState(false);
  if (reservation && !initialized) {
    setInitialized(true);
    setModDate(reservation.date);
    setModTime({ service: reservation.service, time: reservation.time });
    setModGuests(reservation.partySize);
  }

  // Loading
  if (reservation === undefined)
    return (
      <div className="flex h-dvh items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );

  // Not found
  if (!reservation || !token)
    return (
      <div className="mx-auto flex h-dvh max-w-xl flex-col items-center justify-center px-6">
        <h1 className="mb-4 text-2xl font-light tracking-widest uppercase">
          {t("notFound")}
        </h1>
        <p className="text-muted-foreground mb-8 text-sm">
          {t("notFoundMessage")}
        </p>
        <Link
          href="/"
          className="rounded-lg bg-foreground px-8 py-2 font-bold uppercase text-background"
        >
          {t("backToHome")}
        </Link>
      </div>
    );

  const status = reservation.status as StatusKey;
  const style = STATUS_STYLES[status];
  const canModify = status === "pending" || status === "confirmed";
  const canCancel = status === "pending" || status === "confirmed";

  const dateLabel = getDateLabel(reservation.date, locale, tRes);

  const modDateLabel = modDate
    ? getDateLabel(modDate, locale, tRes)
    : tRes("selectDate");

  // Action success screens
  if (actionDone)
    return (
      <div className="mx-auto flex h-dvh max-w-xl flex-col items-center justify-center px-6">
        <h1 className="mb-4 text-2xl font-light tracking-widest uppercase">
          {t(
            actionDone === "cancelled"
              ? "cancelled_success"
              : "modification_success",
          )}
        </h1>
        <Link
          href="/"
          className="rounded-lg bg-foreground px-8 py-2 font-bold uppercase text-background"
        >
          {t("backToHome")}
        </Link>
      </div>
    );

  async function handleCancel() {
    if (submitting) return;
    setSubmitting(true);
    const result = await cancelByToken({ token });
    if (result.success) {
      sendCancelNotif({ reservationId: result.reservationId }).catch(() => {});
      setActionDone("cancelled");
    }
    setSubmitting(false);
  }

  async function handleModify() {
    if (submitting || !modDate || !modTime) return;
    setSubmitting(true);
    const result = await requestModification({
      token,
      date: modDate,
      time: modTime.time,
      service: modTime.service,
      partySize: modGuests,
    });
    if (result.success) {
      sendModifNotif({ reservationId: result.reservationId }).catch(() => {});
      sendModifConfirm({ reservationId: result.reservationId }).catch(() => {});
      setActionDone("modified");
    }
    setSubmitting(false);
  }

  return (
    <div className="mx-auto flex h-dvh max-w-xl flex-col px-6 py-12">
      {/* Header */}
      <div className="shrink-0">
        <Link
          href="/"
          className="mb-2 block text-center text-lg font-bold tracking-widest uppercase"
        >
          Shion
        </Link>
        <h1 className="text-center text-lg font-light tracking-widest uppercase">
          {t("title")}
        </h1>
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center overflow-y-auto">
        <div className="w-full space-y-6">
          {!showModifyForm && (
            <div className="flex justify-center">
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium",
                  style.bg,
                  style.text,
                )}
              >
                <span className={cn("h-2 w-2 rounded-full", style.dot)} />
                {t(status)}
              </div>
            </div>
          )}

          {showModifyForm ? (
            /* Modify form — replaces summary */
            <>
              <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
                <AccordionStep
                  icon={<UtensilsCrossed className="size-5" />}
                  title={tRes("guests")}
                  summary={t("guests", { count: modGuests })}
                  isOpen={modStep === "guests"}
                  onToggle={() =>
                    setModStep(modStep === "guests" ? null : "guests")
                  }
                  isCompleted={modGuests > 0}
                >
                  <GuestPicker
                    value={modGuests}
                    onChange={(count) => {
                      setModGuests(count);
                      setModStep("date");
                    }}
                  />
                </AccordionStep>

                <AccordionStep
                  icon={<CalendarDays className="size-5" />}
                  title={modDate ? modDateLabel : tRes("date")}
                  summary={modDate ? modDateLabel : tRes("selectDate")}
                  isOpen={modStep === "date"}
                  onToggle={() =>
                    setModStep(modStep === "date" ? null : "date")
                  }
                  isCompleted={!!modDate}
                >
                  <DatePicker
                    value={modDate}
                    onChange={(d) => {
                      setModDate(d);
                      setModTime(null);
                      setModStep("time");
                    }}
                    isDateDisabled={isDateDisabled}
                  />
                </AccordionStep>

                <AccordionStep
                  icon={<Clock className="size-5" />}
                  title={modTime ? modTime.time : tRes("time")}
                  summary={modTime ? modTime.time : tRes("selectTime")}
                  isOpen={modStep === "time"}
                  onToggle={() =>
                    setModStep(modStep === "time" ? null : "time")
                  }
                  isCompleted={!!modTime}
                >
                  {!modDate && (
                    <p className="text-muted-foreground text-sm">
                      {tRes("selectDate")}
                    </p>
                  )}
                  {modDate && slotsData && !slotsData.isOpen && (
                    <p className="text-muted-foreground text-sm">
                      {tRes("closed")}
                    </p>
                  )}
                  {modDate && filteredServices.length > 0 && (
                    <TimeSlotPicker
                      services={filteredServices}
                      value={modTime}
                      onChange={setModTime}
                    />
                  )}
                </AccordionStep>
              </div>
            </>
          ) : (
            /* Summary card + optional cancel confirm */
            <>
              <div className="relative rounded-lg border border-border p-6">
                {canModify && (
                  <button
                    type="button"
                    onClick={() => setShowModifyForm(true)}
                    className="absolute top-4 right-4 text-muted-foreground"
                  >
                    <SquarePen className="size-4" />
                  </button>
                )}
                <div className="text-muted-foreground space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <UtensilsCrossed className="size-4 shrink-0" />
                    <span>{t("guests", { count: reservation.partySize })}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarDays className="size-4 shrink-0" />
                    <span>{dateLabel}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="size-4 shrink-0" />
                    <span>{reservation.time}</span>
                  </div>
                  {reservation.notes && (
                    <div className="flex items-start gap-3">
                      <MessageSquare className="mt-0.5 size-4 shrink-0" />
                      <span className="italic">{reservation.notes}</span>
                    </div>
                  )}
                </div>
              </div>

            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 pt-4">
        {showModifyForm ? (
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowModifyForm(false)}
              className="flex-1 rounded-lg border border-border py-2 text-center font-bold uppercase"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              disabled={!modDate || !modTime}
              onClick={() => setShowModifyConfirm(true)}
              className={cn(
                "flex-1 rounded-lg py-2 text-center font-bold uppercase",
                !modDate || !modTime
                  ? "cursor-not-allowed bg-foreground/30 text-background/50"
                  : "bg-foreground text-background",
              )}
            >
              {t("modify")}
            </button>
          </div>
        ) : canCancel ? (
          <button
            type="button"
            onClick={() => setShowCancelConfirm(true)}
            className="w-full rounded-lg border border-red-500/50 py-2 text-center font-bold uppercase text-red-400"
          >
            {t("cancelReservation")}
          </button>
        ) : null}
      </div>

      {/* Cancel confirmation dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
          <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-background p-6">
            <p className="text-center text-sm font-medium">
              {t("cancelConfirm")}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 rounded-lg border border-border py-2 text-center text-sm font-bold uppercase"
              >
                {t("cancelNo")}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleCancel}
                className={cn(
                  "flex-1 rounded-lg py-2 text-center text-sm font-bold uppercase",
                  submitting
                    ? "cursor-not-allowed bg-red-500/30 text-red-300"
                    : "bg-red-500 text-white",
                )}
              >
                {t("cancelYes")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modify confirmation dialog — shows new summary */}
      {showModifyConfirm && modDate && modTime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
          <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-background p-6">
            <div className="rounded-lg border border-border p-4">
              <div className="text-muted-foreground space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <UtensilsCrossed className="size-4 shrink-0" />
                  <span>{t("guests", { count: modGuests })}</span>
                </div>
                <div className="flex items-center gap-3">
                  <CalendarDays className="size-4 shrink-0" />
                  <span>{modDateLabel}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="size-4 shrink-0" />
                  <span>{modTime.time}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowModifyConfirm(false)}
                className="flex-1 rounded-lg border border-border py-2 text-center text-sm font-bold uppercase"
              >
                {t("cancelNo")}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setShowModifyConfirm(false);
                  handleModify();
                }}
                className={cn(
                  "flex-1 rounded-lg py-2 text-center text-sm font-bold uppercase",
                  submitting
                    ? "cursor-not-allowed bg-foreground/30 text-background/50"
                    : "bg-foreground text-background",
                )}
              >
                {t("modify")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
