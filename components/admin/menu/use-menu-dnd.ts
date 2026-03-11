"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { Id } from "@/convex/_generated/dataModel";
import type { MenuItem, CategoryItem, SubcategoryItem, DragType } from "./types";

function getDragType(id: string): DragType {
  if (id.startsWith("cat::")) return "category";
  if (id.startsWith("sub::")) return "subcategory";
  return "item";
}

function parseDroppableId(id: string): {
  categoryId: string;
  subcategoryId: string | undefined;
} | null {
  if (!id.includes("::")) return null;
  if (id.startsWith("cat::") || id.startsWith("sub::")) return null;
  const [categoryId, subPart] = id.split("::");
  return {
    categoryId,
    subcategoryId: subPart === "__none" ? undefined : subPart,
  };
}

export function useMenuDnd({
  items,
  categories,
  subcategories,
  reorderItems,
  reorderCategories,
  reorderSubcategories,
}: {
  items: MenuItem[] | undefined;
  categories: CategoryItem[] | undefined;
  subcategories: SubcategoryItem[] | undefined;
  reorderItems: (args: {
    items: {
      id: Id<"menuItems">;
      order: number;
      category: Id<"categories">;
      subcategory?: Id<"subcategories">;
    }[];
  }) => void;
  reorderCategories: (args: { orderedIds: Id<"categories">[] }) => void;
  reorderSubcategories: (args: { orderedIds: Id<"subcategories">[] }) => void;
}) {
  const [localItems, setLocalItems] = useState<MenuItem[]>([]);
  const [localCategories, setLocalCategories] = useState<CategoryItem[]>([]);
  const [localSubcategories, setLocalSubcategories] = useState<SubcategoryItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragType, setDragType] = useState<DragType | null>(null);

  // Sync server data to local state
  useEffect(() => {
    if (items) setLocalItems(items as MenuItem[]);
  }, [items]);

  useEffect(() => {
    if (categories) setLocalCategories(categories as CategoryItem[]);
  }, [categories]);

  useEffect(() => {
    if (subcategories) setLocalSubcategories(subcategories as SubcategoryItem[]);
  }, [subcategories]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const hierarchy = useMemo(
    () =>
      [...localCategories]
        .sort((a, b) => a.order - b.order)
        .map((cat) => ({
          category: cat,
          subcategories: localSubcategories
            .filter((s) => s.category === cat._id)
            .sort((a, b) => a.order - b.order),
          items: localItems
            .filter((i) => i.category === cat._id)
            .sort((a, b) => a.order - b.order),
        })),
    [localItems, localCategories, localSubcategories],
  );

  const categorySortableIds = useMemo(
    () => localCategories.map((c) => `cat::${c._id}`),
    [localCategories],
  );

  const findCategoryOfItem = useCallback(
    (itemId: string): string | undefined => {
      const item = localItems.find((i) => i._id === itemId);
      return item?.category;
    },
    [localItems],
  );

  const persistItemOrder = useCallback(
    (updatedItems: MenuItem[]) => {
      const toUpdate: {
        id: Id<"menuItems">;
        order: number;
        category: Id<"categories">;
        subcategory?: Id<"subcategories">;
      }[] = [];

      let globalOrder = 0;
      for (const cat of localCategories) {
        const catItems = updatedItems
          .filter((i) => i.category === cat._id)
          .sort((a, b) => a.order - b.order);
        for (const item of catItems) {
          toUpdate.push({
            id: item._id,
            order: globalOrder++,
            category: item.category,
            subcategory: item.subcategory,
          });
        }
      }

      if (toUpdate.length > 0) reorderItems({ items: toUpdate });
    },
    [localCategories, reorderItems],
  );

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    setActiveId(id);
    setDragType(getDragType(id));
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || dragType !== "item") return;

    const activeItemId = active.id as string;
    const overId = over.id as string;

    if (overId.startsWith("cat::") || overId.startsWith("sub::")) return;

    const parsed = parseDroppableId(overId);
    if (parsed) {
      const activeCat = findCategoryOfItem(activeItemId);
      const activeItem = localItems.find((i) => i._id === activeItemId);
      if (
        activeCat === parsed.categoryId &&
        activeItem?.subcategory ===
          (parsed.subcategoryId as Id<"subcategories"> | undefined)
      )
        return;

      setLocalItems((prev) =>
        prev.map((i) =>
          i._id === activeItemId
            ? {
                ...i,
                category: parsed.categoryId as Id<"categories">,
                subcategory: parsed.subcategoryId as Id<"subcategories"> | undefined,
              }
            : i,
        ),
      );
      return;
    }

    const activeCat = findCategoryOfItem(activeItemId);
    const overCat = findCategoryOfItem(overId);
    if (!activeCat || !overCat || activeCat === overCat) return;

    const overItem = localItems.find((i) => i._id === overId);
    setLocalItems((prev) =>
      prev.map((i) =>
        i._id === activeItemId
          ? {
              ...i,
              category: overCat as Id<"categories">,
              subcategory: overItem?.subcategory,
            }
          : i,
      ),
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setDragType(null);

    if (!over) return;

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;
    const type = getDragType(activeIdStr);

    if (type === "category") {
      const aId = activeIdStr.replace("cat::", "");
      const oId = overIdStr.replace("cat::", "");
      if (aId === oId) return;

      setLocalCategories((prev) => {
        const sorted = [...prev].sort((a, b) => a.order - b.order);
        const oldIndex = sorted.findIndex((c) => c._id === aId);
        const newIndex = sorted.findIndex((c) => c._id === oId);
        if (oldIndex === -1 || newIndex === -1) return prev;

        const reordered = arrayMove(sorted, oldIndex, newIndex);
        const updated = reordered.map((c, idx) => ({ ...c, order: idx }));

        reorderCategories({
          orderedIds: updated.map((c) => c._id as Id<"categories">),
        });

        return updated;
      });
    } else if (type === "subcategory") {
      const aId = activeIdStr.replace("sub::", "");
      const oId = overIdStr.replace("sub::", "");
      if (aId === oId) return;

      setLocalSubcategories((prev) => {
        const activeSub = prev.find((s) => s._id === aId);
        if (!activeSub) return prev;

        const siblings = prev
          .filter((s) => s.category === activeSub.category)
          .sort((a, b) => a.order - b.order);

        const oldIndex = siblings.findIndex((s) => s._id === aId);
        const newIndex = siblings.findIndex((s) => s._id === oId);
        if (oldIndex === -1 || newIndex === -1) return prev;

        const reordered = arrayMove(siblings, oldIndex, newIndex);

        reorderSubcategories({
          orderedIds: reordered.map((s) => s._id as Id<"subcategories">),
        });

        const orderMap = new Map<string, number>();
        reordered.forEach((s, idx) => orderMap.set(s._id, idx));

        return prev.map((s) => {
          const newOrder = orderMap.get(s._id);
          return newOrder !== undefined ? { ...s, order: newOrder } : s;
        });
      });
    } else {
      // Item drag
      if (
        overIdStr.startsWith("cat::") ||
        overIdStr.startsWith("sub::") ||
        parseDroppableId(overIdStr)
      ) {
        persistItemOrder(localItems);
        return;
      }

      const activeCat = findCategoryOfItem(activeIdStr);
      const overCat = findCategoryOfItem(overIdStr);

      if (activeCat === overCat && activeIdStr !== overIdStr) {
        setLocalItems((prev) => {
          const activeItem = prev.find((i) => i._id === activeIdStr);
          const catItems = prev
            .filter(
              (i) =>
                i.category === activeCat &&
                i.subcategory === activeItem?.subcategory,
            )
            .sort((a, b) => a.order - b.order);

          const oldIndex = catItems.findIndex((i) => i._id === activeIdStr);
          const newIndex = catItems.findIndex((i) => i._id === overIdStr);
          if (oldIndex === -1 || newIndex === -1) return prev;

          const reordered = arrayMove(catItems, oldIndex, newIndex);
          const orderMap = new Map<string, number>();
          reordered.forEach((item, idx) => orderMap.set(item._id, idx));

          const updated = prev.map((i) => {
            const newOrder = orderMap.get(i._id);
            return newOrder !== undefined ? { ...i, order: newOrder } : i;
          });

          persistItemOrder(updated);
          return updated;
        });
      } else {
        persistItemOrder(localItems);
      }
    }
  }

  // Derived active overlay data
  const activeItem =
    activeId && dragType === "item"
      ? localItems.find((i) => i._id === activeId)
      : undefined;

  const activeCategoryItem =
    activeId && dragType === "category"
      ? localCategories.find((c) => `cat::${c._id}` === activeId)
      : undefined;

  const activeSubcategoryItem =
    activeId && dragType === "subcategory"
      ? localSubcategories.find((s) => `sub::${s._id}` === activeId)
      : undefined;

  return {
    localItems,
    localCategories,
    localSubcategories,
    sensors,
    hierarchy,
    categorySortableIds,
    activeItem,
    activeCategoryItem,
    activeSubcategoryItem,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
