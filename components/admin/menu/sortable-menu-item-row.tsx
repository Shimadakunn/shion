"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { GripVertical, Eye, EyeOff, Pencil, Trash2, EllipsisVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MenuItem } from "./types";
import { SERVICE_LABELS, SERVICE_LABELS_SHORT, SERVICE_BADGE_COLORS } from "./constants";

export function SortableMenuItemRow({
  item,
  isParentHidden,
  onEdit,
  onRemove,
  onToggleActive,
}: {
  item: MenuItem;
  isParentHidden?: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onToggleActive: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id });

  const effectivelyHidden = !item.isActive || isParentHidden;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : effectivelyHidden ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between border border-border bg-background px-2 py-2 sm:px-3 sm:py-3 transition-opacity"
    >
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span
          className={cn(
            "truncate text-sm sm:text-base",
            effectivelyHidden && "text-muted-foreground line-through",
          )}
        >
          {item.name.fr}
        </span>
        <Badge className={cn("shrink-0", SERVICE_BADGE_COLORS[item.service], effectivelyHidden && "opacity-50")}>
          <span className="sm:hidden">{SERVICE_LABELS_SHORT[item.service]}</span>
          <span className="hidden sm:inline">{SERVICE_LABELS[item.service]}</span>
        </Badge>
      </div>

      <div className={cn("flex shrink-0 items-center gap-1 sm:gap-2", effectivelyHidden && "text-muted-foreground")}>
        <span className="text-xs sm:text-sm tabular-nums">{item.price}&euro;</span>

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onToggleActive}
            disabled={isParentHidden}
          >
            {item.isActive && !isParentHidden
              ? <Eye className="h-3.5 w-3.5" />
              : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="destructive" size="icon-xs" onClick={onRemove}>
            <Trash2 className="h-3.5 w-3.5" />
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
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleActive} disabled={isParentHidden}>
                {item.isActive && !isParentHidden
                  ? <Eye className="h-3.5 w-3.5" />
                  : <EyeOff className="h-3.5 w-3.5" />}
                {item.isActive ? "Hide" : "Show"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onRemove}>
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
