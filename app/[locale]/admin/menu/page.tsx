"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo } from "react";
import { MenuItemForm } from "@/components/admin/menu/menu-item-form";
import { CategoryForm } from "@/components/admin/menu/category-form";
import { SubcategoryForm } from "@/components/admin/menu/subcategory-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMenuDnd } from "@/components/admin/menu/use-menu-dnd";
import { SortableCategorySection } from "@/components/admin/menu/sortable-category-section";
import {
  ItemDragOverlay,
  CategoryDragOverlay,
  SubcategoryDragOverlay,
} from "@/components/admin/menu/drag-overlays";
import {
  MenuFilters,
  EMPTY_FILTERS,
  hasActiveFilters,
  type MenuFilterState,
} from "@/components/admin/menu/menu-filters";
import type { MenuItem, SubcategoryItem } from "@/components/admin/menu/types";

export default function AdminMenuPage() {
  const items = useQuery(api.menu.getAll);
  const categories = useQuery(api.categories.getAll);
  const subcategories = useQuery(api.subcategories.getAll);

  const removeItem = useMutation(api.menu.remove);
  const removeCategory = useMutation(api.categories.remove);
  const updateCategory = useMutation(api.categories.update);
  const reorderItems = useMutation(api.menu.reorder);
  const reorderCategories = useMutation(api.categories.reorder);
  const reorderSubcategories = useMutation(api.subcategories.reorder);
  const removeSubcategory = useMutation(api.subcategories.remove);
  const updateSubcategory = useMutation(api.subcategories.update);
  const updateItem = useMutation(api.menu.update);

  // Editing state
  const [editingItem, setEditingItem] = useState<
    | Id<"menuItems">
    | {
        new: true;
        categoryId: Id<"categories">;
        subcategoryId?: Id<"subcategories">;
      }
    | null
  >(null);
  const [editingCategory, setEditingCategory] = useState<
    Id<"categories"> | "new" | null
  >(null);
  const [editingSubcategory, setEditingSubcategory] = useState<
    { id: Id<"subcategories"> } | { newForCategory: Id<"categories"> } | null
  >(null);
  const [filters, setFilters] = useState<MenuFilterState>(EMPTY_FILTERS);

  const {
    localItems,
    localCategories,
    localSubcategories,
    sensors,
    collisionDetection,
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
  } = useMenuDnd({
    items,
    categories,
    subcategories,
    reorderItems,
    reorderCategories,
    reorderSubcategories,
  });

  const isFiltering = hasActiveFilters(filters);
  const filteredHierarchy = useMemo(() => {
    if (!isFiltering) return hierarchy;

    return hierarchy
      .filter(
        (entry) =>
          filters.categories.size === 0 ||
          filters.categories.has(entry.category._id),
      )
      .map((entry) => {
        let filteredItems = entry.items;
        if (filters.services.size > 0)
          filteredItems = filteredItems.filter((i) =>
            filters.services.has(i.service),
          );

        let filteredSubs = entry.subcategories;
        if (filters.subcategories.size > 0)
          filteredSubs = filteredSubs.filter((s) =>
            filters.subcategories.has(s._id),
          );

        // When filtering by subcategory, also filter items to only show matching subcategories
        if (filters.subcategories.size > 0)
          filteredItems = filteredItems.filter(
            (i) => !i.subcategory || filters.subcategories.has(i.subcategory),
          );

        return { ...entry, items: filteredItems, subcategories: filteredSubs };
      })
      .filter(
        (entry) => entry.items.length > 0 || entry.subcategories.length > 0,
      );
  }, [hierarchy, filters, isFiltering]);

  const filteredItemCount = useMemo(
    () => filteredHierarchy.reduce((sum, entry) => sum + entry.items.length, 0),
    [filteredHierarchy],
  );

  // Derived form data
  const currentItem =
    editingItem && typeof editingItem === "string"
      ? items?.find((i) => i._id === editingItem)
      : undefined;

  const currentCategory =
    editingCategory && editingCategory !== "new"
      ? categories?.find((c) => c._id === editingCategory)
      : undefined;

  const currentSubcategory =
    editingSubcategory && "id" in editingSubcategory
      ? subcategories?.find((s) => s._id === editingSubcategory.id)
      : undefined;

  async function handleRemoveCategory(id: Id<"categories">) {
    try {
      await removeCategory({ id });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Cannot delete");
    }
  }

  async function handleRemoveSubcategory(id: Id<"subcategories">) {
    try {
      await removeSubcategory({ id });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Cannot delete");
    }
  }

  return (
    <div>
      <h1 className="mb-4 sm:mb-8 text-lg sm:text-xl font-light tracking-[0.2em] uppercase">
        Menu management
      </h1>

      {/* Plates section */}
      <div className="mb-12">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-medium tracking-wider uppercase">
            Plates
          </h2>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs text-muted-foreground">
              {isFiltering
                ? `${filteredItemCount} / ${localItems.length} plate(s)`
                : `${localItems.length} plate(s)`}
            </span>
            <MenuFilters
              filters={filters}
              onChange={setFilters}
              categories={localCategories}
              subcategories={localSubcategories}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingCategory("new")}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add category</span>
            </Button>
          </div>
        </div>

        <MenuItemForm
          key={editingItem ? String(editingItem) : "closed-item"}
          item={currentItem}
          defaultCategoryId={
            editingItem && typeof editingItem === "object"
              ? editingItem.categoryId
              : undefined
          }
          defaultSubcategoryId={
            editingItem && typeof editingItem === "object"
              ? editingItem.subcategoryId
              : undefined
          }
          open={editingItem !== null}
          onOpenChange={(open) => {
            if (!open) setEditingItem(null);
          }}
        />

        <CategoryForm
          key={editingCategory ? String(editingCategory) : "closed-cat"}
          category={currentCategory}
          open={editingCategory !== null}
          onOpenChange={(open) => {
            if (!open) setEditingCategory(null);
          }}
          onDelete={
            currentCategory
              ? () => {
                  handleRemoveCategory(currentCategory._id);
                  setEditingCategory(null);
                }
              : undefined
          }
        />

        <SubcategoryForm
          key={
            editingSubcategory
              ? JSON.stringify(editingSubcategory)
              : "closed-sub"
          }
          subcategory={currentSubcategory}
          defaultCategoryId={
            editingSubcategory && "newForCategory" in editingSubcategory
              ? editingSubcategory.newForCategory
              : undefined
          }
          open={editingSubcategory !== null}
          onOpenChange={(open) => {
            if (!open) setEditingSubcategory(null);
          }}
          onDelete={
            currentSubcategory
              ? () => {
                  handleRemoveSubcategory(currentSubcategory._id);
                  setEditingSubcategory(null);
                }
              : undefined
          }
        />

        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categorySortableIds}
            strategy={verticalListSortingStrategy}
          >
            {filteredHierarchy.map(
              ({ category, subcategories: subs, items: catItems }) => (
                <SortableCategorySection
                  key={category._id}
                  category={category}
                  subcategories={subs}
                  items={catItems}
                  isDraggingItem={isDraggingItem}
                  overContainerId={overContainerId}
                  onEditItem={(id) => setEditingItem(id)}
                  onRemoveItem={(id) => removeItem({ id })}
                  onToggleItemActive={(item: MenuItem) =>
                    updateItem({ id: item._id, isActive: !item.isActive })
                  }
                  onEditCategory={() => setEditingCategory(category._id)}
                  onToggleActive={() =>
                    updateCategory({
                      id: category._id,
                      isActive: category.isActive === false,
                    })
                  }
                  onAddItem={() =>
                    setEditingItem({ new: true, categoryId: category._id })
                  }
                  onAddItemToSubcategory={(subId) =>
                    setEditingItem({
                      new: true,
                      categoryId: category._id,
                      subcategoryId: subId,
                    })
                  }
                  onAddSubcategory={() =>
                    setEditingSubcategory({ newForCategory: category._id })
                  }
                  onEditSubcategory={(id) => setEditingSubcategory({ id })}
                  onToggleSubcategoryActive={(sub: SubcategoryItem) =>
                    updateSubcategory({
                      id: sub._id,
                      isActive: sub.isActive === false,
                    })
                  }
                />
              ),
            )}
          </SortableContext>

          <DragOverlay>
            {activeItem ? <ItemDragOverlay item={activeItem} /> : null}
            {activeCategoryItem ? (
              <CategoryDragOverlay category={activeCategoryItem} />
            ) : null}
            {activeSubcategoryItem ? (
              <SubcategoryDragOverlay subcategory={activeSubcategoryItem} />
            ) : null}
          </DragOverlay>
        </DndContext>

        {isFiltering && filteredHierarchy.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No plates match the current filters.
          </p>
        )}

        {!isFiltering &&
          categories &&
          localCategories.length === 0 &&
          localItems.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No categories yet. Add a category to get started.
            </p>
          )}
      </div>

    </div>
  );
}
