"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CalendarDays,
  ChevronLeft,
  Clock,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function ConfirmPage() {
  const t = useTranslations("confirm");
  const tRes = useTranslations("reservation");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const createReservation = useMutation(api.reservations.create);
  const sendEmails = useMutation(api.emails.sendNewReservationEmails);

  const guests = Number(searchParams.get("guests") ?? 2);
  const date = searchParams.get("date") ?? "";
  const service = searchParams.get("service") ?? "";
  const time = searchParams.get("time") ?? "";

  const dateLabel = (() => {
    if (!date) return "";
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    if (date === todayStr) return tRes("today");
    const tmrw = new Date(now);
    tmrw.setDate(tmrw.getDate() + 1);
    const tmrwStr = `${tmrw.getFullYear()}-${String(tmrw.getMonth() + 1).padStart(2, "0")}-${String(tmrw.getDate()).padStart(2, "0")}`;
    if (date === tmrwStr) return tRes("tomorrow");
    return formatDateLabel(date, locale);
  })();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const { id: reservationId, managementToken } = await createReservation({
      date,
      time,
      service,
      partySize: guests,
      name,
      email,
      notes: notes || undefined,
    });

    // Send emails in background — don't block the user
    sendEmails({ reservationId, managementToken }).catch(() => {});

    setConfirmed(true);
    setSubmitting(false);
  }

  if (confirmed) {
    return (
      <div className="mx-auto flex h-dvh max-w-xl flex-col items-center justify-center px-6">
        <h1 className="mb-4 text-2xl font-light tracking-widest uppercase">
          {t("success")}
        </h1>
        <p className="text-muted-foreground mb-8 text-sm">
          {t("successMessage")}
        </p>
        <Link
          href="/"
          className="rounded-lg bg-foreground px-8 py-2 font-bold uppercase text-background"
        >
          Shion
        </Link>
      </div>
    );
  }

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

      {/* Content — centered / scrollable */}
      <div className="flex flex-1 items-center overflow-y-auto">
        <div className="w-full space-y-6">
          {/* Summary */}
          <div className="rounded-lg border border-border p-6">
            <h3 className="mb-4 text-xs font-medium tracking-wider uppercase">
              {t("summary")}
            </h3>
            <div className="text-muted-foreground space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <UtensilsCrossed className="size-4 shrink-0" />
                <span>{t("guests", { count: guests })}</span>
              </div>
              <div className="flex items-center gap-3">
                <CalendarDays className="size-4 shrink-0" />
                <span>{dateLabel}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="size-4 shrink-0" />
                <span>{time}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            id="reservation-form"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <Label className="mb-2 tracking-wider uppercase">
                {t("name")}
              </Label>
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <Label className="mb-2 tracking-wider uppercase">
                {t("email")}
              </Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Label className="mb-2 tracking-wider uppercase">
                {t("notes")}
              </Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </form>
        </div>
      </div>

      {/* Footer — pinned bottom */}
      <div className="flex shrink-0 gap-4 pt-4">
        <Link
          href="/reservation"
          className="flex items-center justify-center rounded-lg border border-border px-3 py-2"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <button
          type="submit"
          form="reservation-form"
          disabled={submitting}
          className={cn(
            "flex-1 rounded-lg py-2 text-center font-bold uppercase",
            submitting
              ? "cursor-not-allowed bg-foreground/30 text-background/50"
              : "bg-foreground text-background",
          )}
        >
          {tRes("reserve")}
        </button>
      </div>
    </div>
  );
}
