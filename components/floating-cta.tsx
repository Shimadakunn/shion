"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { MapPin, UtensilsCrossed, Clock } from "lucide-react";

export function FloatingCTA() {
  const t = useTranslations("cta");
  const settings = useQuery(api.settings.get);

  const googleMapsUrl = settings?.googleMapsUrl;

  const iconBtn = cn(
    buttonVariants({ variant: "outline", size: "lg" }),
    "shadow-lg px-3",
  );

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full">
      <div className="absolute inset-0 bg-linear-to-t from-black to-transparent pointer-events-none" />
      <div className="relative flex items-center justify-center gap-2 pb-4 pt-24">
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
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "shadow-lg",
          )}
        >
          {t("reserve")}
        </Link>
      </div>
    </div>
  );
}
