"use client";

import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { MenuItemForm } from "@/components/admin/menu-item-form";
import { FormuleForm } from "@/components/admin/formule-form";
import { Plus, Trash2 } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

export default function AdminMenuPage() {
  const t = useTranslations("admin.menuEditor");
  const items = useQuery(api.menu.getAll);
  const formules = useQuery(api.formules.getAll);
  const removeItem = useMutation(api.menu.remove);
  const removeFormule = useMutation(api.formules.remove);

  const [editingItem, setEditingItem] = useState<Id<"menuItems"> | "new" | null>(null);
  const [editingFormule, setEditingFormule] = useState<Id<"formules"> | "new" | null>(null);

  const currentItem =
    editingItem && editingItem !== "new"
      ? items?.find((i) => i._id === editingItem)
      : undefined;

  const currentFormule =
    editingFormule && editingFormule !== "new"
      ? formules?.find((f) => f._id === editingFormule)
      : undefined;

  return (
    <div>
      <h1 className="mb-8 text-xl font-light tracking-[0.2em] uppercase">
        {t("title")}
      </h1>

      {/* Menu items section */}
      <div className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium tracking-wider uppercase">
            Plats
          </h2>
          <button
            onClick={() => setEditingItem("new")}
            className="flex items-center gap-2 text-xs font-medium tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t("addItem")}
          </button>
        </div>

        {editingItem && (
          <div className="mb-6">
            <MenuItemForm
              item={currentItem}
              onClose={() => setEditingItem(null)}
            />
          </div>
        )}

        <div className="space-y-2">
          {items?.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between border border-border p-4"
            >
              <div className="flex items-center gap-4">
                <span className={item.isActive ? "" : "text-muted-foreground line-through"}>
                  {item.name.fr}
                </span>
                <span className="text-muted-foreground text-xs uppercase">
                  {item.category}
                </span>
                <span className="text-muted-foreground text-xs">
                  {item.service}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm">{item.price}€</span>
                <button
                  onClick={() => setEditingItem(item._id)}
                  className="text-muted-foreground hover:text-foreground text-xs uppercase transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => removeItem({ id: item._id })}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formules section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium tracking-wider uppercase">
            Formules
          </h2>
          <button
            onClick={() => setEditingFormule("new")}
            className="flex items-center gap-2 text-xs font-medium tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t("addFormule")}
          </button>
        </div>

        {editingFormule && (
          <div className="mb-6">
            <FormuleForm
              formule={currentFormule}
              onClose={() => setEditingFormule(null)}
            />
          </div>
        )}

        <div className="space-y-2">
          {formules?.map((f) => (
            <div
              key={f._id}
              className="flex items-center justify-between border border-border p-4"
            >
              <div className="flex items-center gap-4">
                <span className={f.isActive ? "" : "text-muted-foreground line-through"}>
                  {f.name.fr}
                </span>
                <span className="text-muted-foreground text-xs">
                  {f.service}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm">{f.price}€</span>
                <button
                  onClick={() => setEditingFormule(f._id)}
                  className="text-muted-foreground hover:text-foreground text-xs uppercase transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => removeFormule({ id: f._id })}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
