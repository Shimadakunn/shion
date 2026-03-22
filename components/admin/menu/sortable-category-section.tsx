"use client";

import { useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Plus, GripVertical, Eye, EyeOff, Pencil, EllipsisVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";
import type { MenuItem, CategoryItem, SubcategoryItem } from "./types";
import { SortableMenuItemRow } from "./sortable-menu-item-row";
import { SortableSubcategorySection } from "./sortable-subcategory-section";

export function SortableCategorySection({
  category,
  subcategories,
  items,
  isDraggingItem,
  overContainerId,
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
  isDraggingItem: boolean;
  overContainerId: string | null;
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

  const uncatDroppableId = `${category._id}::__none`;
  const { setNodeRef: setUncatDroppableRef, isOver: isUncatOver } =
    useDroppable({ id: uncatDroppableId });

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
  const isUncatTargeted = overContainerId === uncatDroppableId;

  return (
    <div ref={setSortableRef} style={style} className="mb-6">
      <div className={cn(
        "mb-2 flex items-center gap-1.5 sm:gap-2 transition-opacity",
        isCategoryHidden && "opacity-50",
      )}>
        <button
          type="button"
          className="shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
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

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-1">
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
            {category.isActive !== false
              ? <Eye className="h-3 w-3" />
              : <EyeOff className="h-3 w-3 text-muted-foreground" />}
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={onEditCategory}>
            <Pencil className="h-3 w-3" />
          </Button>
        </div>

        {/* Mobile actions dropdown */}
        <div className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-xs" />
              }
            >
              <EllipsisVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom">
              <DropdownMenuItem onClick={onAddItem}>
                <Plus className="h-3.5 w-3.5" />
                Add plate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddSubcategory}>
                <Plus className="h-3.5 w-3.5" />
                Add subcategory
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onEditCategory}>
                <Pencil className="h-3.5 w-3.5" />
                Edit category
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleActive}>
                {category.isActive !== false
                  ? <Eye className="h-3.5 w-3.5" />
                  : <EyeOff className="h-3.5 w-3.5" />}
                {category.isActive !== false ? "Hide" : "Show"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <SortableContext
        items={uncategorizedItemIds}
        strategy={verticalListSortingStrategy}
        id={uncatDroppableId}
      >
        <div
          ref={setUncatDroppableRef}
          className={cn(
            "space-y-1 transition-all duration-150",
            isDraggingItem ? "min-h-12 rounded border border-dashed border-transparent" : "min-h-4",
            (isUncatOver || isUncatTargeted) && "border-primary/40 bg-accent/30",
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
        {subcategories.map((sub) => {
          const subDroppableId = `${category._id}::${sub._id}`;
          return (
            <SortableSubcategorySection
              key={sub._id}
              subcategory={sub}
              isCategoryHidden={isCategoryHidden}
              droppableId={subDroppableId}
              isDraggingItem={isDraggingItem}
              isTargeted={overContainerId === subDroppableId}
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
          );
        })}
      </SortableContext>
    </div>
  );
}
