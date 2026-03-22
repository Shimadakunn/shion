"use client";

import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/reservation/date-picker";
import { TimeSlotPicker } from "@/components/reservation/time-slot-picker";
import {
  CalendarDays,
  Clock,
  Users,
  MessageSquare,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
} from "lucide-react";

type StatusKey =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

const STATUS_STYLES: Record<StatusKey, { bg: string; text: string; dot: string }> = {
  pending: { bg: "bg-amber-500/10", text: "text-amber-700", dot: "bg-amber-500" },
  confirmed: { bg: "bg-emerald-500/10", text: "text-emerald-700", dot: "bg-emerald-500" },
  cancelled: { bg: "bg-red-500/10", text: "text-red-600", dot: "bg-red-400" },
  completed: { bg: "bg-zinc-500/10", text: "text-zinc-600", dot: "bg-zinc-400" },
  no_show: { bg: "bg-orange-500/10", text: "text-orange-600", dot: "bg-orange-400" },
};

function isLunchService(service: string): boolean {
  const lower = service.toLowerCase();
  return ["lunch", "midi", "déjeuner", "ランチ", "昼"].some((kw) => lower.includes(kw));
}

export default function ManageReservationPage() {
  const t = useTranslations("manage");
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const reservation = useQuery(api.reservations.getByToken, token ? { token } : "skip");
  const cancelByToken = useMutation(api.reservations.cancelByToken);
  const requestModification = useMutation(api.reservations.requestModificationByToken);
  const sendCancelNotif = useMutation(api.emails.sendCancellationNotificationToAdmin);
  const sendModifNotif = useMutation(api.emails.sendModificationNotificationToAdmin);
  const sendModifConfirm = useMutation(api.emails.sendModificationConfirmationToCustomer);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showModifyForm, setShowModifyForm] = useState(false);
  const [actionDone, setActionDone] = useState<"cancelled" | "modified" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modify form state
  const [modDate, setModDate] = useState<string | null>(null);
  const [modTime, setModTime] = useState<{ service: string; time: string } | null>(null);
  const [modGuests, setModGuests] = useState(2);

  // Load available slots for the selected modification date
  const slotsData = useQuery(
    api.reservations.getAvailableSlots,
    modDate ? { date: modDate } : "skip",
  );

  // Initialize modify form when reservation loads
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (!reservation || initialized) return;
    setModDate(reservation.date);
    setModTime({ service: reservation.service, time: reservation.time });
    setModGuests(reservation.partySize);
    setInitialized(true);
  }, [reservation, initialized]);

  // Loading
  if (reservation === undefined)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-6 w-6 animate-spin border-2 border-t-transparent" />
      </div>
    );

  // Not found
  if (!reservation || !token)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-2xl font-light tracking-wider">{t("notFound")}</h1>
          <p className="text-muted-foreground mb-8 text-sm">{t("notFoundMessage")}</p>
          <Link href="/" className={buttonVariants({ variant: "default", size: "lg" })}>
            {t("backToHome")}
          </Link>
        </div>
      </div>
    );

  const status = reservation.status as StatusKey;
  const style = STATUS_STYLES[status];
  const canModify = status === "pending" || status === "confirmed";
  const canCancel = status === "pending" || status === "confirmed";

  const dateObj = new Date(reservation.date);
  const dateLabel = dateObj.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Action success screens
  if (actionDone === "cancelled")
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-2xl font-light tracking-wider">{t("cancelled_success")}</h1>
          <Link href="/" className={buttonVariants({ variant: "default", size: "lg" })}>
            {t("backToHome")}
          </Link>
        </div>
      </div>
    );

  if (actionDone === "modified")
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-2xl font-light tracking-wider">{t("modification_success")}</h1>
          <Link href="/" className={buttonVariants({ variant: "default", size: "lg" })}>
            {t("backToHome")}
          </Link>
        </div>
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
    <div className="mx-auto min-h-screen max-w-xl px-6 pb-32 pt-24">
      <Link
        href="/"
        className="mb-12 block text-center text-lg font-semibold tracking-[0.3em] uppercase"
      >
        Shion
      </Link>

      <h1 className="mb-8 text-center text-2xl font-light tracking-[0.2em] uppercase">
        {t("title")}
      </h1>

      {/* Status badge */}
      <div className="mb-8 flex justify-center">
        <div className={cn("inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium", style.bg, style.text)}>
          <span className={cn("h-2 w-2 rounded-full", style.dot)} />
          {t(status)}
        </div>
      </div>

      {/* Reservation details */}
      <div className="mb-8 border border-border p-6 space-y-4">
        <div className="flex items-center gap-3 text-sm">
          <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="capitalize">{dateLabel}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="tabular-nums">{reservation.time}</span>
          <span className="text-muted-foreground ml-auto inline-flex items-center gap-1 text-xs">
            {isLunchService(reservation.service) ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
            {reservation.service}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
          <span>{t("guests", { count: reservation.partySize })}</span>
        </div>
        {reservation.notes && (
          <div className="flex items-start gap-3 text-sm">
            <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <span className="italic">{reservation.notes}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {canModify && !showModifyForm && !showCancelConfirm && (
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowModifyForm(true)}
          >
            <ChevronDown className="mr-2 h-4 w-4" />
            {t("modifyReservation")}
          </Button>
          <Button
            variant="ghost"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => setShowCancelConfirm(true)}
          >
            {t("cancelReservation")}
          </Button>
        </div>
      )}

      {/* Cancel confirmation */}
      {showCancelConfirm && (
        <div className="border border-red-200 bg-red-50 p-6 space-y-4">
          <p className="text-sm font-medium text-red-800">{t("cancelConfirm")}</p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowCancelConfirm(false)}
            >
              {t("cancelNo")}
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              disabled={submitting}
              onClick={handleCancel}
            >
              {t("cancelYes")}
            </Button>
          </div>
        </div>
      )}

      {/* Modify form */}
      {showModifyForm && (
        <div className="border border-border p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium tracking-wider uppercase">
              {t("modifyReservation")}
            </h3>
            <button onClick={() => setShowModifyForm(false)}>
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <p className="text-muted-foreground text-xs">{t("modifyDescription")}</p>

          {/* Guest picker */}
          <div>
            <label className="text-muted-foreground mb-2 block text-xs tracking-wider uppercase">
              {t("guests", { count: modGuests })}
            </label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={modGuests <= 1}
                onClick={() => setModGuests((g) => Math.max(1, g - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-medium tabular-nums w-8 text-center">{modGuests}</span>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={modGuests >= 8}
                onClick={() => setModGuests((g) => Math.min(8, g + 1))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Date picker */}
          <DatePicker value={modDate} onChange={(d) => { setModDate(d); setModTime(null); }} />

          {/* Time slots */}
          {modDate && slotsData && slotsData.isOpen && slotsData.services.length > 0 && (
            <TimeSlotPicker
              services={slotsData.services}
              value={modTime}
              onChange={setModTime}
            />
          )}

          {modDate && slotsData && !slotsData.isOpen && (
            <p className="text-muted-foreground text-center text-sm py-4">
              Closed on this day
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowModifyForm(false)}
            >
              {t("cancelNo")}
            </Button>
            <Button
              className="flex-1"
              disabled={submitting || !modDate || !modTime}
              onClick={handleModify}
            >
              {t("submitModification")}
            </Button>
          </div>

          {/* Cancel option at the bottom of modify form */}
          {canCancel && (
            <>
              <hr className="border-border" />
              <Button
                variant="ghost"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => { setShowModifyForm(false); setShowCancelConfirm(true); }}
              >
                {t("cancelReservation")}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
