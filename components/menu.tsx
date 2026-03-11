"use client";

import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "./motion";
import type { Id } from "@/convex/_generated/dataModel";

type Service = "lunch" | "dinner";
type Locale = "fr" | "en" | "jp";

export function Menu() {
  const t = useTranslations("menu");
  const locale = useLocale() as Locale;
  const [service, setService] = useState<Service>("lunch");

  const items = useQuery(api.menu.getActiveItems, { service });
  const formules = useQuery(api.formules.getActiveFormules, { service });
  const categories = useQuery(api.categories.getActive);
  const subcategories = useQuery(api.subcategories.getActive);

  const subcategoryMap = useMemo(() => {
    const map = new Map<
      string,
      { name: { fr: string; en: string; jp: string }; order: number }
    >();
    for (const sub of subcategories ?? []) map.set(sub._id, sub);
    return map;
  }, [subcategories]);

  // Build sections: category -> subcategory groups -> items
  const sections = useMemo(() => {
    if (!categories || !items) return [];

    // Active subcategory IDs — items in inactive subcategories are hidden
    const activeSubIds = new Set(
      (subcategories ?? []).map((s) => s._id),
    );

    return categories
      .map((cat) => {
        const catItems = items.filter(
          (i) =>
            i.category === cat._id &&
            (!i.subcategory || activeSubIds.has(i.subcategory)),
        );
        if (catItems.length === 0) return null;

        // Group by subcategory, preserving subcategory order
        const groups: {
          subcategoryId: Id<"subcategories"> | undefined;
          items: typeof catItems;
        }[] = [];
        const bySubMap = new Map<string | undefined, typeof catItems>();

        for (const item of catItems) {
          const key = item.subcategory ?? undefined;
          const existing = bySubMap.get(key);
          if (existing) existing.push(item);
          else {
            const arr = [item];
            bySubMap.set(key, arr);
            groups.push({
              subcategoryId: key as Id<"subcategories"> | undefined,
              items: arr,
            });
          }
        }

        // Sort groups: uncategorized first, then subcategories by order
        groups.sort((a, b) => {
          if (!a.subcategoryId) return -1;
          if (!b.subcategoryId) return 1;
          const aOrder = subcategoryMap.get(a.subcategoryId)?.order ?? 0;
          const bOrder = subcategoryMap.get(b.subcategoryId)?.order ?? 0;
          return aOrder - bOrder;
        });

        return { category: cat, groups };
      })
      .filter(Boolean) as {
      category: (typeof categories)[number];
      groups: {
        subcategoryId: Id<"subcategories"> | undefined;
        items: NonNullable<typeof items>;
      }[];
    }[];
  }, [categories, items, subcategoryMap]);

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
          <Button
            key={s}
            variant={s === service ? "default" : "ghost"}
            size="lg"
            onClick={() => setService(s)}
            className="px-8 tracking-wider uppercase"
          >
            {t(s)}
          </Button>
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
        {sections.map(({ category, groups }) => (
          <div key={category._id}>
            <h3 className="text-muted-foreground mb-8 text-center text-xs font-medium tracking-[0.3em] uppercase">
              {category.name[locale]}
            </h3>
            <div className="space-y-8">
              {groups.map(({ subcategoryId, items: groupItems }) => (
                <div key={subcategoryId ?? "__none"}>
                  {subcategoryId && (
                    <h4 className="text-muted-foreground/70 mb-4 text-center text-[0.65rem] font-medium tracking-[0.25em] uppercase">
                      — {subcategoryMap.get(subcategoryId)?.name[locale]} —
                    </h4>
                  )}
                  <div className="space-y-6">
                    {groupItems.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-start justify-between border-b border-dotted border-border pb-6"
                      >
                        <div className="space-y-1">
                          <h4 className="font-medium">
                            {item.name[locale]}
                          </h4>
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
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {items && items.length === 0 && formules && formules.length === 0 && (
        <p className="text-muted-foreground py-16 text-center text-sm">—</p>
      )}
    </section>
  );
}
