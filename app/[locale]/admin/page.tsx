"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function formatToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function AdminDashboard() {
  const t = useTranslations("admin.dashboard");
  const today = formatToday();
  const todayReservations = useQuery(api.reservations.getByDate, {
    date: today,
  });

  const confirmed =
    todayReservations?.filter((r) => r.status === "confirmed") ?? [];
  const totalCovers = confirmed.reduce((sum, r) => sum + r.partySize, 0);

  return (
    <div>
      <h1 className="mb-8 text-xl font-light tracking-[0.2em] uppercase">
        {t("title")}
      </h1>

      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard
          label={t("todayReservations")}
          value={String(confirmed.length)}
        />
        <StatCard label={t("totalCovers")} value={String(totalCovers)} />
        <StatCard label={t("upcoming")} value={String(confirmed.length)} />
      </div>

      {/* Today's reservations list */}
      {confirmed.length > 0 && (
        <div className="mt-10">
          <div className="space-y-3">
            {confirmed.map((r) => (
              <div
                key={r._id}
                className="flex items-center justify-between border border-border p-4"
              >
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {r.time} — {r.partySize} couverts
                  </p>
                </div>
                <span className="text-xs font-medium uppercase tracking-wider text-green-600">
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border p-6">
      <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
        {label}
      </p>
      <p className="mt-2 text-3xl font-light">{value}</p>
    </div>
  );
}
