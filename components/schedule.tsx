"use client";

import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo } from "react";
import { FadeIn } from "./motion";

const SERVICE_LABELS: Record<string, "lunch" | "dinner"> = {
  lunch: "lunch",
  dinner: "dinner",
};

// Monday → Sunday display order
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const DATE_LOCALE_MAP: Record<string, string> = {
  fr: "fr-FR",
  en: "en-GB",
  jp: "ja-JP",
};

function formatSpecialDate(dateStr: string, locale: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(DATE_LOCALE_MAP[locale] ?? locale, {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
}

function ServiceTimes({
  services,
  t,
}: {
  services: { name: string; openTime: string; closeTime: string }[];
  t: ReturnType<typeof useTranslations<"schedule">>;
}) {
  const lunch = services.find((s) => s.name === "lunch");
  const dinner = services.find((s) => s.name === "dinner");

  return (
    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground sm:min-w-[20rem]">
      <span>
        {lunch && (
          <>
            <span className="text-amber-300/80 text-xs uppercase tracking-wider">
              {t("lunch")}
            </span>{" "}
            {lunch.openTime}–{lunch.closeTime}
          </>
        )}
      </span>
      <span className="text-right">
        {dinner && (
          <>
            <span className="text-amber-300/80 text-xs uppercase tracking-wider">
              {t("dinner")}
            </span>{" "}
            {dinner.openTime}–{dinner.closeTime}
          </>
        )}
      </span>
    </div>
  );
}

export function Schedule() {
  const t = useTranslations("schedule");
  const locale = useLocale();
  const schedule = useQuery(api.schedule.getAll);
  const specialDates = useQuery(api.schedule.getSpecialDates);

  const upcomingSpecialDates = useMemo(() => {
    if (!specialDates) return [];
    const today = new Date().toISOString().slice(0, 10);
    return specialDates
      .filter((d) => d.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [specialDates]);

  if (!schedule) return null;

  const byDay = new Map(schedule.map((d) => [d.dayOfWeek, d]));

  return (
    <section id="schedule" className="mx-auto max-w-xl px-6 my-24 scroll-mt-24">
      <FadeIn>
        <h2 className="text-center text-3xl tracking-widest uppercase mb-12 font-serif font-bold">
          {t("title")}
        </h2>
      </FadeIn>

      {/* Weekly schedule */}
      <FadeIn delay={0.15}>
        <div className="space-y-3 sm:space-y-3">
          {DAY_ORDER.map((day) => {
            const entry = byDay.get(day);
            const isOpen = entry?.isOpen ?? false;

            return (
              <div key={day} className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <span className="text-sm font-medium tracking-wide uppercase shrink-0">
                  {t(`days.${day}`)}
                </span>

                <span className="hidden sm:block border-b border-dotted border-white/10 flex-1 translate-y-[-4px]" />

                {isOpen && entry?.services.length ? (
                  <ServiceTimes services={entry.services} t={t} />
                ) : (
                  <span className="text-sm text-muted-foreground/50 italic">
                    {t("closed")}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </FadeIn>

      {/* Upcoming special dates */}
      {upcomingSpecialDates.length > 0 && (
        <FadeIn delay={0.3}>
          <div className="mt-14">
            <h3 className="text-center text-xs tracking-[0.25em] uppercase text-muted-foreground mb-6">
              {t("specialDates")}
            </h3>

            <div className="space-y-3">
              {upcomingSpecialDates.map((sd) => (
                <div
                  key={sd._id}
                  className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                >
                  <span className="text-sm font-medium shrink-0 capitalize">
                    {formatSpecialDate(sd.date, locale)}
                  </span>

                  <span className="hidden sm:block border-b border-dotted border-white/10 flex-1 translate-y-[-4px]" />

                  {sd.isOpen && sd.services?.length ? (
                    <div className="sm:text-right">
                      <ServiceTimes services={sd.services} t={t} />
                      {sd.note && (
                        <p className="text-xs text-muted-foreground/60 mt-0.5">
                          {sd.note}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="sm:text-right">
                      <span className="text-sm text-muted-foreground/50 italic">
                        {t("specialClosed")}
                      </span>
                      {sd.note && (
                        <p className="text-xs text-muted-foreground/60 mt-0.5">
                          {sd.note}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      )}
    </section>
  );
}
