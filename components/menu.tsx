"use client";

import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "./motion";
import type { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";

const MENU_IMAGE = "kg25a95k663p6cbgtrzxe2gd3n83abb3" as Id<"_storage">;

type Service = "lunch" | "dinner";
type Locale = "fr" | "en" | "jp";

export function Menu() {
  const t = useTranslations("menu");
  const locale = useLocale() as Locale;
  const [service, setService] = useState<Service>("lunch");
  const imageUrl = useQuery(api.files.getUrl, { storageId: MENU_IMAGE });

  const items = useQuery(api.menu.getActiveItems, { service });
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
    const activeSubIds = new Set((subcategories ?? []).map((s) => s._id));

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
    <section id="menu" className="mx-4 md:mx-24 my-24 scroll-mt-24">
      <FadeIn>
        <h2 className="text-center text-3xl tracking-widest uppercase mb-12 font-serif font-bold">
          {t("title")}
        </h2>
      </FadeIn>

      <div className="mb-8 flex justify-center gap-1">
        {(["lunch", "dinner"] as const).map((s) => (
          <Button
            key={s}
            variant={s === service ? "default" : "outline"}
            size="lg"
            onClick={() => setService(s)}
            className="px-8 tracking-wider uppercase"
          >
            {t(s)}
          </Button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Menu content */}
        <div className="min-w-0 flex-1 space-y-8 lg:w-2/3">
          {sections.map(({ category, groups }) => (
            <div key={category._id}>
              <h3 className="mb-2 text-3xl font-serif tracking-tighter text-muted-foreground">
                {category.name[locale]}
              </h3>
              <div className="space-y-2">
                {groups.map(({ subcategoryId, items: groupItems }) => (
                  <div key={subcategoryId ?? "__none"}>
                    {subcategoryId && (
                      <h4 className="text-muted-foreground tracking-tighter font-serif text-md">
                        {subcategoryMap.get(subcategoryId)?.name[locale]}
                      </h4>
                    )}
                    <div className="space-y-2">
                      {groupItems.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-start justify-between"
                        >
                          <div>
                            <h4 className="text-2xl font-light">
                              {item.name[locale]}
                            </h4>
                            <p className="text-muted-foreground max-w-md text-sm font-light">
                              {item.description[locale]}
                            </p>
                          </div>
                          <span className="text-amber-300 ml-8 shrink-0 text-lg font-light">
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

          {/* Empty state */}
          {items && items.length === 0 && (
            <p className="text-muted-foreground py-16 text-center text-sm">—</p>
          )}
        </div>

        {/* Side image — sticky on desktop, below menu on mobile */}
        {imageUrl && (
          <aside className="lg:w-1/3 lg:shrink-0 lg:self-start lg:sticky lg:top-8 relative">
            <img src={imageUrl} alt="menu image" className="w-full" />
            <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/80" />
            <div className="absolute inset-0 bg-linear-to-l from-black/20 via-transparent to-black/20" />
          </aside>
        )}
      </div>
    </section>
  );
}
