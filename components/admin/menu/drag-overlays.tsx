"use client";

import { Badge } from "@/components/ui/badge";
import { GripVertical } from "lucide-react";
import type { MenuItem, CategoryItem, SubcategoryItem } from "./types";
import { SERVICE_LABELS, SERVICE_BADGE } from "./constants";

export function ItemDragOverlay({ item }: { item: MenuItem }) {
  return (
    <div className="flex items-center justify-between border border-primary/40 bg-background p-3 shadow-lg">
      <div className="flex items-center gap-3">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <span>{item.name.fr}</span>
        <Badge className={SERVICE_BADGE}>{SERVICE_LABELS[item.service]}</Badge>
      </div>
      <span className="text-sm tabular-nums">{item.price}&euro;</span>
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
