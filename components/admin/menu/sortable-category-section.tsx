"use client";

import { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical, Eye, EyeOff, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import type { MenuItem, CategoryItem, SubcategoryItem } from "./types";
import { SortableMenuItemRow } from "./sortable-menu-item-row";
import { SortableSubcategorySection } from "./sortable-subcategory-section";

export function SortableCategorySection({
  category,
  subcategories,
  items,
  onEditItem,
  onRemoveItem,
  onToggleItemActive,
  onEditCategory,
  onToggleActive,
  onAddItem,
  onAddItemToSubcategory,
  onAddSubcategory,
  onEditSubcategory,
  onToggleSubcategoryActive,
}: {
  category: CategoryItem;
  subcategories: SubcategoryItem[];
  items: MenuItem[];
  onEditItem: (id: Id<"menuItems">) => void;
  onRemoveItem: (id: Id<"menuItems">) => void;
  onToggleItemActive: (item: MenuItem) => void;
  onEditCategory: () => void;
  onToggleActive: () => void;
  onAddItem: () => void;
  onAddItemToSubcategory: (subId: Id<"subcategories">) => void;
  onAddSubcategory: () => void;
  onEditSubcategory: (id: Id<"subcategories">) => void;
  onToggleSubcategoryActive: (sub: SubcategoryItem) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `cat::${category._id}` });

  const { setNodeRef: setUncatDroppableRef, isOver: isUncatOver } =
    useDroppable({ id: `${category._id}::__none` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const subIds = useMemo(
    () => new Set(subcategories.map((s) => s._id)),
    [subcategories],
  );

  const subcategorySortableIds = useMemo(
    () => subcategories.map((s) => `sub::${s._id}`),
    [subcategories],
  );

  const uncategorizedItems = useMemo(
    () =>
      items
        .filter((i) => !i.subcategory || !subIds.has(i.subcategory))
        .sort((a, b) => a.order - b.order),
    [items, subIds],
  );

  const uncategorizedItemIds = useMemo(
    () => uncategorizedItems.map((i) => i._id),
    [uncategorizedItems],
  );

  const isCategoryHidden = category.isActive === false;

  return (
    <div ref={setSortableRef} style={style} className="mb-6">
      <div className={cn(
        "mb-2 flex items-center gap-2 transition-opacity",
        isCategoryHidden && "opacity-50",
      )}>
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <h3 className={cn(
          "text-xs font-medium tracking-wider uppercase text-muted-foreground",
          isCategoryHidden && "line-through",
        )}>
          {category.name.fr}
        </h3>
        <span className="text-xs text-muted-foreground">({items.length})</span>
        <div className="flex-1 border-t border-border" />
        <Button
          variant="ghost"
          size="sm"
          className="h-6 gap-1 text-[0.65rem]"
          onClick={onAddSubcategory}
        >
          <Plus className="h-3 w-3" />
          Subcategory
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 gap-1 text-[0.65rem]"
          onClick={onAddItem}
        >
          <Plus className="h-3 w-3" />
          Plate
        </Button>
        <Button variant="ghost" size="icon-xs" onClick={onToggleActive}>
          {category.isActive !== false ? (
            <Eye className="h-3 w-3" />
          ) : (
            <EyeOff className="h-3 w-3 text-muted-foreground" />
          )}
        </Button>
        <Button variant="ghost" size="icon-xs" onClick={onEditCategory}>
          <Pencil className="h-3 w-3" />
        </Button>
      </div>

      <SortableContext
        items={uncategorizedItemIds}
        strategy={verticalListSortingStrategy}
        id={`${category._id}::__none`}
      >
        <div
          ref={setUncatDroppableRef}
          className={cn(
            "min-h-4 space-y-1 transition-colors",
            isUncatOver && uncategorizedItems.length === 0 && "bg-accent/30",
          )}
        >
          {uncategorizedItems.map((item) => (
            <SortableMenuItemRow
              key={item._id}
              item={item}
              isParentHidden={isCategoryHidden}
              onEdit={() => onEditItem(item._id)}
              onRemove={() => onRemoveItem(item._id)}
              onToggleActive={() => onToggleItemActive(item)}
            />
          ))}
        </div>
      </SortableContext>

      <SortableContext
        items={subcategorySortableIds}
        strategy={verticalListSortingStrategy}
      >
        {subcategories.map((sub) => (
          <SortableSubcategorySection
            key={sub._id}
            subcategory={sub}
            isCategoryHidden={isCategoryHidden}
            droppableId={`${category._id}::${sub._id}`}
            items={items
              .filter((i) => i.subcategory === sub._id)
              .sort((a, b) => a.order - b.order)}
            onEditItem={onEditItem}
            onRemoveItem={onRemoveItem}
            onToggleItemActive={onToggleItemActive}
            onAddItem={() => onAddItemToSubcategory(sub._id)}
            onEditSubcategory={() => onEditSubcategory(sub._id)}
            onToggleActive={() => onToggleSubcategoryActive(sub)}
          />
        ))}
      </SortableContext>
    </div>
  );
}
