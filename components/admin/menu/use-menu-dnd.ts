"use client";

import { useState, useMemo, useCallback } from "react";
import {
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
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

// pointerWithin first (precise for containers), then fall back to rectIntersection
const multiContainerCollision: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) return pointerHits;
  return rectIntersection(args);
};

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
  const [overContainerId, setOverContainerId] = useState<string | null>(null);

  const [prevItems, setPrevItems] = useState(items);
  if (items && items !== prevItems) {
    setPrevItems(items);
    setLocalItems(items as MenuItem[]);
  }

  const [prevCategories, setPrevCategories] = useState(categories);
  if (categories && categories !== prevCategories) {
    setPrevCategories(categories);
    setLocalCategories(categories as CategoryItem[]);
  }

  const [prevSubcategories, setPrevSubcategories] = useState(subcategories);
  if (subcategories && subcategories !== prevSubcategories) {
    setPrevSubcategories(subcategories);
    setLocalSubcategories(subcategories as SubcategoryItem[]);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
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

  // Resolve a sub:: or cat:: over ID to the container droppable ID
  const resolveContainerId = useCallback(
    (overId: string): string | null => {
      if (overId.startsWith("sub::")) {
        const subId = overId.replace("sub::", "");
        const sub = localSubcategories.find((s) => s._id === subId);
        if (sub) return `${sub.category}::${sub._id}`;
      }
      if (overId.startsWith("cat::")) {
        const catId = overId.replace("cat::", "");
        return `${catId}::__none`;
      }
      return null;
    },
    [localSubcategories],
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

  function moveItemToContainer(activeItemId: string, containerId: string) {
    const parsed = parseDroppableId(containerId);
    if (!parsed) return;

    const activeItem = localItems.find((i) => i._id === activeItemId);
    if (
      activeItem?.category === parsed.categoryId &&
      activeItem?.subcategory === (parsed.subcategoryId as Id<"subcategories"> | undefined)
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
  }

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    setActiveId(id);
    setDragType(getDragType(id));
    setOverContainerId(null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || dragType !== "item") return;

    const activeItemId = active.id as string;
    const overId = over.id as string;

    // Resolve sub:: / cat:: to container IDs and move item there
    const resolved = resolveContainerId(overId);
    if (resolved) {
      setOverContainerId(resolved);
      moveItemToContainer(activeItemId, resolved);
      return;
    }

    // Over a droppable container directly
    const parsed = parseDroppableId(overId);
    if (parsed) {
      setOverContainerId(overId);
      moveItemToContainer(activeItemId, overId);
      return;
    }

    // Over another item — move to that item's container
    const activeCat = findCategoryOfItem(activeItemId);
    const overCat = findCategoryOfItem(overId);
    const overItem = localItems.find((i) => i._id === overId);

    if (overItem) {
      const containerKey = `${overCat}::${overItem.subcategory ?? "__none"}`;
      setOverContainerId(containerKey);
    }

    if (!activeCat || !overCat || activeCat === overCat) {
      // Same category — check if subcategory differs
      const activeItem = localItems.find((i) => i._id === activeItemId);
      if (activeItem?.subcategory !== overItem?.subcategory) {
        setLocalItems((prev) =>
          prev.map((i) =>
            i._id === activeItemId
              ? { ...i, subcategory: overItem?.subcategory }
              : i,
          ),
        );
      }
      return;
    }

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
    setOverContainerId(null);

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
      // Item drag — resolve sub::/cat:: over targets
      const resolved = resolveContainerId(overIdStr);
      if (resolved || parseDroppableId(overIdStr)) {
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

  const isDraggingItem = dragType === "item";

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
    collisionDetection: multiContainerCollision,
    hierarchy,
    categorySortableIds,
    isDraggingItem,
    overContainerId,
    activeItem,
    activeCategoryItem,
    activeSubcategoryItem,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
