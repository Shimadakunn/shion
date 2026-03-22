"use client";

import { Badge } from "@/components/ui/badge";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuItem, CategoryItem, SubcategoryItem } from "./types";
import { SERVICE_LABELS, SERVICE_LABELS_SHORT, SERVICE_BADGE_COLORS } from "./constants";

export function ItemDragOverlay({ item }: { item: MenuItem }) {
  return (
    <div className="flex items-center justify-between border border-primary/40 bg-background px-2 py-2 sm:p-3 shadow-lg">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate text-sm sm:text-base">{item.name.fr}</span>
        <Badge className={cn("shrink-0", SERVICE_BADGE_COLORS[item.service])}>
          <span className="sm:hidden">{SERVICE_LABELS_SHORT[item.service]}</span>
          <span className="hidden sm:inline">{SERVICE_LABELS[item.service]}</span>
        </Badge>
      </div>
      <span className="shrink-0 text-xs sm:text-sm tabular-nums">{item.price}&euro;</span>
    </div>
  );
}

export function CategoryDragOverlay({ category }: { category: CategoryItem }) {
  return (
    <div className="flex items-center gap-3 border border-primary/40 bg-background p-3 shadow-lg">
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      <span className="text-xs font-medium tracking-wider uppercase">
        {category.name.fr}
      </span>
    </div>
  );
}

export function SubcategoryDragOverlay({
  subcategory,
}: {
  subcategory: SubcategoryItem;
}) {
  return (
    <div className="flex items-center gap-3 border border-primary/40 bg-background p-3 shadow-lg">
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      <span className="text-[0.65rem] font-medium tracking-[0.15em] uppercase text-muted-foreground/70">
        {subcategory.name.fr}
      </span>
    </div>
  );
}
