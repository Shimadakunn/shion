"use client";

import { useTranslations } from "next-intl";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ConfirmPage() {
  const t = useTranslations("confirm");
  const searchParams = useSearchParams();
  const createReservation = useMutation(api.reservations.create);
  const sendEmails = useMutation(api.emails.sendNewReservationEmails);

  const guests = Number(searchParams.get("guests") ?? 2);
  const date = searchParams.get("date") ?? "";
  const service = searchParams.get("service") ?? "";
  const time = searchParams.get("time") ?? "";

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
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-2xl font-light tracking-wider">
            {t("success")}
          </h1>
          <p className="text-muted-foreground mb-8 text-sm">
            {t("successMessage")}
          </p>
          <Link
            href="/"
            className={buttonVariants({ variant: "default", size: "lg" })}
          >
            Shion
          </Link>
        </div>
      </div>
    );
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

      {/* Summary */}
      <div className="mb-10 border border-border p-6">
        <h3 className="mb-3 text-xs font-medium tracking-wider uppercase">
          {t("summary")}
        </h3>
        <div className="text-muted-foreground space-y-1 text-sm">
          <p>{t("guests", { count: guests })}</p>
          <p>{date}</p>
          <p>
            {service} — {time}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="flex items-center gap-4 pt-4">
          <Link
            href="/reservation"
            className={buttonVariants({ variant: "outline" })}
          >
            {t("back")}
          </Link>
          <Button
            type="submit"
            disabled={submitting}
            className="flex-1"
          >
            {t("submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
