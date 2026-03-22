"use client";

import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { FadeIn } from "./motion";
import type { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";
import { storageIds } from "@/lib/storage-ids";

type Service = "lunch" | "dinner";
type Locale = "fr" | "en" | "jp";

export function Menu() {
  const t = useTranslations("menu");
  const locale = useLocale() as Locale;
  const [service, setService] = useState<Service>("lunch");
  const [visible, setVisible] = useState(true);
  const imageUrl = useQuery(api.files.getUrl, { storageId: storageIds.menu });

  // Load both services upfront to avoid flash on switch
  const lunchItems = useQuery(api.menu.getActiveItems, { service: "lunch" });
  const dinnerItems = useQuery(api.menu.getActiveItems, { service: "dinner" });
  const items = service === "lunch" ? lunchItems : dinnerItems;
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
  }, [categories, items, subcategories, subcategoryMap]);

  function handleServiceChange(s: Service) {
    if (s === service) return;
    setVisible(false);
    setTimeout(() => {
      setService(s);
      setTimeout(() => setVisible(true), 20);
    }, 150);
  }

  return (
    <section id="menu" className="mx-4 md:mx-24 my-24 scroll-mt-24">
      <FadeIn>
        <h2 className="text-center text-3xl tracking-widest uppercase mb-12 font-serif font-bold">
          {t("title")}
        </h2>
      </FadeIn>

      <div className="mb-8 flex justify-center gap-2">
        {(["lunch", "dinner"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleServiceChange(s)}
            className={cn(
              "rounded-[6px] px-12 py-1 transition-colors",
              s === service
                ? "bg-foreground text-background"
                : "border border-white/70 text-white/90",
            )}
          >
            {t(s)}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Menu content */}
        <div
          className={cn(
            "min-w-0 flex-1 space-y-8 lg:w-2/3 transition-opacity duration-150",
            visible ? "opacity-100" : "opacity-0",
          )}
        >
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
          <aside className="lg:w-1/3 lg:shrink-0 lg:self-start lg:sticky lg:top-8 relative overflow-hidden">
            <Image
              src={imageUrl}
              alt=""
              width={600}
              height={800}
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="w-full h-auto"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-black/30" />
            <div className="absolute inset-0 bg-linear-to-l from-black/30 via-transparent to-black/30" />

            {/* Top curve — black fading down */}
            <svg
              className="absolute top-0 left-0 z-10 h-40 w-full sm:h-56"
              viewBox="0 0 600 300"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="menu-curve-top" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="black" />
                  <stop offset="40%" stopColor="black" stopOpacity="0.6" />
                  <stop offset="70%" stopColor="black" stopOpacity="0.15" />
                  <stop offset="90%" stopColor="black" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,300 Q300,120 600,300 L600,0 L0,0 Z"
                fill="url(#menu-curve-top)"
              />
            </svg>

            {/* Bottom curve — black fading up */}
            <svg
              className="absolute bottom-0 left-0 z-10 h-40 w-full sm:h-56"
              viewBox="0 0 600 300"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="menu-curve-bottom"
                  x1="0"
                  y1="1"
                  x2="0"
                  y2="0"
                >
                  <stop offset="0%" stopColor="black" />
                  <stop offset="40%" stopColor="black" stopOpacity="0.6" />
                  <stop offset="70%" stopColor="black" stopOpacity="0.15" />
                  <stop offset="90%" stopColor="black" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,0 Q300,180 600,0 L600,300 L0,300 Z"
                fill="url(#menu-curve-bottom)"
              />
            </svg>
          </aside>
        )}
      </div>
    </section>
  );
}
