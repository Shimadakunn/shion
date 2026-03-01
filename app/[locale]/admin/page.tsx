"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              {t("todayReservations")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-light">{confirmed.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              {t("totalCovers")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-light">{totalCovers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              {t("upcoming")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-light">{confirmed.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's reservations list */}
      {confirmed.length > 0 && (
        <div className="mt-10 space-y-3">
          {confirmed.map((r) => (
            <Card key={r._id}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {r.time} — {r.partySize} couverts
                  </p>
                </div>
                <Badge variant="secondary">{r.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
