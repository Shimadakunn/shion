"use client";

import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FadeIn } from "./motion";

type Service = "lunch" | "dinner";
type Locale = "fr" | "en" | "jp";

export function Menu() {
  const t = useTranslations("menu");
  const locale = useLocale() as Locale;
  const [service, setService] = useState<Service>("lunch");

  const items = useQuery(api.menu.getActiveItems, { service });
  const formules = useQuery(api.formules.getActiveFormules, { service });

  const entrees = items?.filter((i) => i.category === "entrees") ?? [];
  const plats = items?.filter((i) => i.category === "plats") ?? [];
  const desserts = items?.filter((i) => i.category === "desserts") ?? [];

  return (
    <section id="menu" className="mx-auto max-w-4xl px-6 py-32">
      <FadeIn>
        <h2 className="mb-16 text-center text-3xl font-light tracking-[0.3em] uppercase">
          {t("title")}
        </h2>
      </FadeIn>

      {/* Service toggle */}
      <div className="mb-16 flex justify-center gap-1">
        {(["lunch", "dinner"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setService(s)}
            className={cn(
              "px-8 py-3 text-xs font-medium tracking-wider uppercase transition-colors",
              s === service
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t(s)}
          </button>
        ))}
      </div>

      {/* Formules */}
      {formules && formules.length > 0 && (
        <div className="mb-20">
          <h3 className="text-muted-foreground mb-8 text-center text-xs font-medium tracking-[0.3em] uppercase">
            {t("formules")}
          </h3>
          <div className="space-y-6">
            {formules.map((f) => (
              <div
                key={f._id}
                className="flex items-start justify-between border-b border-dotted border-border pb-6"
              >
                <div className="space-y-1">
                  <h4 className="font-medium">{f.name[locale]}</h4>
                  <p className="text-muted-foreground max-w-md text-sm">
                    {f.description[locale]}
                  </p>
                </div>
                <span className="text-primary ml-8 shrink-0 text-lg font-light">
                  {f.price}€
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* À la carte */}
      <div className="space-y-16">
        {[
          { key: "entrees" as const, items: entrees },
          { key: "plats" as const, items: plats },
          { key: "desserts" as const, items: desserts },
        ].map(
          ({ key, items: categoryItems }) =>
            categoryItems.length > 0 && (
              <div key={key}>
                <h3 className="text-muted-foreground mb-8 text-center text-xs font-medium tracking-[0.3em] uppercase">
                  {t(key)}
                </h3>
                <div className="space-y-6">
                  {categoryItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-start justify-between border-b border-dotted border-border pb-6"
                    >
                      <div className="space-y-1">
                        <h4 className="font-medium">{item.name[locale]}</h4>
                        <p className="text-muted-foreground max-w-md text-sm">
                          {item.description[locale]}
                        </p>
                      </div>
                      <span className="text-primary ml-8 shrink-0 text-lg font-light">
                        {item.price}€
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ),
        )}
      </div>

      {/* Empty state */}
      {items && items.length === 0 && formules && formules.length === 0 && (
        <p className="text-muted-foreground py-16 text-center text-sm">
          —
        </p>
      )}
    </section>
  );
}
