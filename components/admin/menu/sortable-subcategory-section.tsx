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
import type { MenuItem, SubcategoryItem } from "./types";
import { SortableMenuItemRow } from "./sortable-menu-item-row";

export function SortableSubcategorySection({
  subcategory,
  isCategoryHidden,
  droppableId,
  isDraggingItem,
  isTargeted,
  items,
  onEditItem,
  onRemoveItem,
  onToggleItemActive,
  onAddItem,
  onEditSubcategory,
  onToggleActive,
}: {
  subcategory: SubcategoryItem;
  isCategoryHidden: boolean;
  droppableId: string;
  isDraggingItem: boolean;
  isTargeted: boolean;
  items: MenuItem[];
  onEditItem: (id: Id<"menuItems">) => void;
  onRemoveItem: (id: Id<"menuItems">) => void;
  onToggleItemActive: (item: MenuItem) => void;
  onAddItem: () => void;
  onEditSubcategory: () => void;
  onToggleActive: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `sub::${subcategory._id}` });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: droppableId,
  });

  const itemIds = useMemo(() => items.map((i) => i._id), [items]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isHidden = isCategoryHidden || subcategory.isActive === false;
  const isDropTarget = isOver || isTargeted;

  return (
    <div ref={setSortableRef} style={style} className="mb-2 ml-3 sm:ml-6 border-l-2 border-border/40 pl-2 sm:pl-3">
      <div className={cn(
        "mb-1 flex items-center gap-1.5 sm:gap-2 transition-opacity",
        isHidden && "opacity-50",
      )}>
        <button
          type="button"
          className="shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <h4 className={cn(
          "text-[0.65rem] font-medium tracking-[0.15em] uppercase text-muted-foreground/70",
          isHidden && "line-through",
        )}>
          {subcategory.name.fr}
        </h4>
        <span className="text-[0.6rem] text-muted-foreground/50">
          ({items.length})
        </span>
        <div className="flex-1 border-t border-border/50" />

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-5 gap-1 text-[0.6rem]"
            onClick={onAddItem}
          >
            <Plus className="h-2.5 w-2.5" />
            Plate
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={onToggleActive}>
            {subcategory.isActive !== false
              ? <Eye className="h-2.5 w-2.5" />
              : <EyeOff className="h-2.5 w-2.5 text-muted-foreground" />}
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={onEditSubcategory}>
            <Pencil className="h-2.5 w-2.5" />
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
              <EllipsisVertical className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom">
              <DropdownMenuItem onClick={onAddItem}>
                <Plus className="h-3.5 w-3.5" />
                Add plate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onEditSubcategory}>
                <Pencil className="h-3.5 w-3.5" />
                Edit subcategory
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleActive}>
                {subcategory.isActive !== false
                  ? <Eye className="h-3.5 w-3.5" />
                  : <EyeOff className="h-3.5 w-3.5" />}
                {subcategory.isActive !== false ? "Hide" : "Show"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <SortableContext
        items={itemIds}
        strategy={verticalListSortingStrategy}
        id={droppableId}
      >
        <div
          ref={setDroppableRef}
          className={cn(
            "space-y-1 transition-all duration-150",
            isDraggingItem ? "min-h-12 rounded border border-dashed border-transparent" : "min-h-[2rem]",
            isDropTarget && "border-primary/40 bg-accent/30",
          )}
        >
          {items.map((item) => (
            <SortableMenuItemRow
              key={item._id}
              item={item}
              isParentHidden={isHidden}
              onEdit={() => onEditItem(item._id)}
              onRemove={() => onRemoveItem(item._id)}
              onToggleActive={() => onToggleItemActive(item)}
            />
          ))}
          {items.length === 0 && !isDraggingItem && (
            <div className="border border-dashed border-border/50 p-2 sm:p-3 text-center text-xs text-muted-foreground/50">
              &mdash;
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
