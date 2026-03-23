"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MapPin, UtensilsCrossed, Clock } from "lucide-react";

export function FloatingCTA() {
  const t = useTranslations("cta");
  const settings = useQuery(api.settings.get);

  const googleMapsUrl = settings?.googleMapsUrl;

  const iconBtn = "pointer-events-auto rounded-sm border border-white/70 px-2 py-2 shadow-lg";

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 z-50 w-full">
      <div className="absolute inset-0 bg-linear-to-t from-black to-transparent" />
      <div className="relative flex items-center justify-center gap-2 pb-4 pt-24 text-white/90">
        <a href="#menu" className={iconBtn} aria-label={t("menu")}>
          <UtensilsCrossed className="size-5" />
        </a>
        <a href="#schedule" className={iconBtn} aria-label={t("schedule")}>
          <Clock className="size-5" />
        </a>
        {googleMapsUrl && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={iconBtn}
            aria-label="Google Maps"
          >
            <MapPin className="size-5" />
          </a>
        )}
        <Link
          href="/reservation"
          className="pointer-events-auto rounded-sm bg-foreground px-4 py-2 font-semibold text-background shadow-lg text-sm"
        >
          {t("reserve")}
        </Link>
      </div>
    </div>
  );
}
