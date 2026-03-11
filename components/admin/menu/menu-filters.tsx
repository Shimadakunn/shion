"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import type { CategoryItem, SubcategoryItem } from "./types";
import { SERVICE_LABELS } from "./constants";

type Service = "lunch" | "dinner" | "both";

export type MenuFilterState = {
  services: Set<Service>;
  categories: Set<Id<"categories">>;
  subcategories: Set<Id<"subcategories">>;
};

export const EMPTY_FILTERS: MenuFilterState = {
  services: new Set(),
  categories: new Set(),
  subcategories: new Set(),
};

export function hasActiveFilters(filters: MenuFilterState): boolean {
  return (
    filters.services.size > 0 ||
    filters.categories.size > 0 ||
    filters.subcategories.size > 0
  );
}

function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function MenuFilters({
  filters,
  onChange,
  categories,
  subcategories,
}: {
  filters: MenuFilterState;
  onChange: (filters: MenuFilterState) => void;
  categories: CategoryItem[];
  subcategories: SubcategoryItem[];
}) {
  const active = hasActiveFilters(filters);

  const visibleSubcategories = useMemo(() => {
    if (filters.categories.size === 0) return subcategories;
    return subcategories.filter((s) => filters.categories.has(s.category));
  }, [subcategories, filters.categories]);

  function toggleService(service: Service) {
    onChange({ ...filters, services: toggleInSet(filters.services, service) });
  }

  function toggleCategory(id: Id<"categories">) {
    const nextCategories = toggleInSet(filters.categories, id);
    // Clear subcategory filters that no longer belong to selected categories
    const nextSubcategories = new Set(filters.subcategories);
    for (const subId of nextSubcategories) {
      const sub = subcategories.find((s) => s._id === subId);
      if (sub && nextCategories.size > 0 && !nextCategories.has(sub.category))
        nextSubcategories.delete(subId);
    }
    onChange({
      ...filters,
      categories: nextCategories,
      subcategories: nextSubcategories,
    });
  }

  function toggleSubcategory(id: Id<"subcategories">) {
    onChange({
      ...filters,
      subcategories: toggleInSet(filters.subcategories, id),
    });
  }

  function clearAll() {
    onChange(EMPTY_FILTERS);
  }

  const activeCount =
    filters.services.size + filters.categories.size + filters.subcategories.size;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className={cn(active && "text-primary")}
          />
        }
      >
        <Filter className="h-4 w-4" />
        Filter
        {activeCount > 0 && (
          <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center bg-primary px-1 text-[10px] text-primary-foreground">
            {activeCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-0">
        {/* Service */}
        <div className="border-b border-border px-3 py-2">
          <p className="mb-1.5 text-[10px] font-medium tracking-wider uppercase text-muted-foreground">
            Service
          </p>
          <div className="flex flex-wrap gap-1">
            {(Object.keys(SERVICE_LABELS) as Service[]).map((service) => (
              <button
                key={service}
                onClick={() => toggleService(service)}
                className={cn(
                  "px-2 py-0.5 text-[11px] border transition-colors",
                  filters.services.has(service)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {SERVICE_LABELS[service]}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="border-b border-border px-1 py-1">
            <p className="mb-0.5 px-2 pt-1 text-[10px] font-medium tracking-wider uppercase text-muted-foreground">
              Category
            </p>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => toggleCategory(cat._id)}
                className="flex w-full items-center gap-2 px-2 py-1 text-xs transition-colors hover:bg-muted/60"
              >
                <Check
                  className={cn(
                    "h-3 w-3 shrink-0",
                    filters.categories.has(cat._id)
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
                <span className="truncate">{cat.name.fr}</span>
              </button>
            ))}
          </div>
        )}

        {/* Subcategories */}
        {visibleSubcategories.length > 0 && (
          <div className="border-b border-border px-1 py-1">
            <p className="mb-0.5 px-2 pt-1 text-[10px] font-medium tracking-wider uppercase text-muted-foreground">
              Subcategory
            </p>
            {visibleSubcategories.map((sub) => (
              <button
                key={sub._id}
                onClick={() => toggleSubcategory(sub._id)}
                className="flex w-full items-center gap-2 px-2 py-1 text-xs transition-colors hover:bg-muted/60"
              >
                <Check
                  className={cn(
                    "h-3 w-3 shrink-0",
                    filters.subcategories.has(sub._id)
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
                <span className="truncate">{sub.name.fr}</span>
              </button>
            ))}
          </div>
        )}

        {/* Clear */}
        {active && (
          <div className="px-3 py-2">
            <button
              onClick={clearAll}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
