"use client";

import { useTranslations } from "next-intl";
import { FadeIn, FadeInScale } from "./motion";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-16">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/5 absolute -right-32 top-1/4 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-primary/3 absolute -left-32 bottom-1/4 h-96 w-96 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-12 text-center">
        {/* Restaurant name */}
        <FadeIn>
          <div className="space-y-4">
            <h1 className="text-6xl font-light tracking-[0.4em] uppercase sm:text-7xl lg:text-8xl">
              Shion
            </h1>
            <p className="text-muted-foreground text-sm tracking-[0.3em] uppercase">
              {t("subtitle")}
            </p>
          </div>
        </FadeIn>

        {/* Badges row */}
        <FadeIn delay={0.2}>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {/* Best Table badge */}
            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-zinc-900 p-4 text-white">
              <span className="text-[8px] font-medium uppercase tracking-wider">
                {t("bestTable").split(" ").slice(0, 2).join(" ")}
              </span>
              <span className="text-lg font-bold">2025</span>
              <span className="text-[7px] uppercase tracking-wider">
                {t("bestTable").split(" ").slice(2).join(" ")}
              </span>
            </div>

            {/* Google rating */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold text-blue-500">G</span>
                <span className="text-2xl font-light">4.9</span>
              </div>
              <span className="text-muted-foreground text-xs">
                {t("googleRating")}
              </span>
            </div>

            {/* Average price */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-primary text-3xl font-light">45€</span>
              <span className="text-muted-foreground text-xs">
                {t("avgPrice")}
              </span>
            </div>
          </div>
        </FadeIn>

        {/* Placeholder image area */}
        <FadeInScale delay={0.4}>
          <div className="mt-8 h-64 w-full max-w-lg overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50">
            <div className="flex h-full items-center justify-center">
              <span className="text-muted-foreground/30 text-sm tracking-wider">
                Photo du restaurant
              </span>
            </div>
          </div>
        </FadeInScale>
      </div>
    </section>
  );
}
