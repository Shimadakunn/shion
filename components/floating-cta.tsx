"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { MapPin } from "lucide-react";

export function FloatingCTA() {
  const t = useTranslations("cta");
  const settings = useQuery(api.settings.get);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const googleMapsUrl = settings?.googleMapsUrl;

  return (
    <div
      className={cn(
        "fixed bottom-8 left-1/2 z-50 -translate-x-1/2 transition-all duration-500",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none",
      )}
    >
      <div className="flex items-center gap-2">
        <Link
          href="/reservation"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "shadow-lg",
          )}
        >
          {t("reserve")}
        </Link>
        {googleMapsUrl && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "shadow-lg px-3",
            )}
            aria-label="Google Maps"
          >
            <MapPin className="size-5" />
          </a>
        )}
      </div>
    </div>
  );
}
