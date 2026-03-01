"use client";

import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { MenuItemForm } from "@/components/admin/menu-item-form";
import { FormuleForm } from "@/components/admin/formule-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingItem("new")}
          >
            <Plus className="h-4 w-4" />
            {t("addItem")}
          </Button>
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
              <div className="flex items-center gap-3">
                <span className={item.isActive ? "" : "text-muted-foreground line-through"}>
                  {item.name.fr}
                </span>
                <Badge variant="outline">{item.category}</Badge>
                {item.subcategory && <Badge variant="outline">{item.subcategory}</Badge>}
                <Badge variant="secondary">{item.service}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">{item.price}€</span>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setEditingItem(item._id)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="icon-xs"
                  onClick={() => removeItem({ id: item._id })}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingFormule("new")}
          >
            <Plus className="h-4 w-4" />
            {t("addFormule")}
          </Button>
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
              <div className="flex items-center gap-3">
                <span className={f.isActive ? "" : "text-muted-foreground line-through"}>
                  {f.name.fr}
                </span>
                <Badge variant="secondary">{f.service}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">{f.price}€</span>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setEditingFormule(f._id)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="icon-xs"
                  onClick={() => removeFormule({ id: f._id })}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
