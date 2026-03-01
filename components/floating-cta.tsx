"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function FloatingCTA() {
  const t = useTranslations("cta");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-8 left-1/2 z-50 -translate-x-1/2 transition-all duration-500",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none",
      )}
    >
      <Link
        href="/reservation"
        className="bg-foreground text-background hover:bg-foreground/90 inline-block px-8 py-3 text-xs font-medium tracking-wider uppercase shadow-lg transition-colors"
      >
        {t("reserve")}
      </Link>
    </div>
  );
}
