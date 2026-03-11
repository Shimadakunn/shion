"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { SERVICE_LABELS, SERVICE_BADGE } from "./constants";

type Formule = {
  _id: Id<"formules">;
  name: { fr: string; en: string; jp: string };
  service: string;
  price: number;
  isActive: boolean;
};

export function FormulesList({
  formules,
  onAdd,
  onEdit,
  onRemove,
}: {
  formules: Formule[] | undefined;
  onAdd: () => void;
  onEdit: (id: Id<"formules">) => void;
  onRemove: (id: Id<"formules">) => void;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium tracking-wider uppercase">
          Formules
        </h2>
        <Button variant="ghost" size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Add set menu
        </Button>
      </div>

      <div className="space-y-2">
        {formules?.map((f) => (
          <div
            key={f._id}
            className="flex items-center justify-between border border-border p-4"
          >
            <div className="flex items-center gap-3">
              <span
                className={
                  f.isActive ? "" : "text-muted-foreground line-through"
                }
              >
                {f.name.fr}
              </span>
              <Badge className={SERVICE_BADGE}>
                {SERVICE_LABELS[f.service]}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">{f.price}&euro;</span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onEdit(f._id)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="destructive"
                size="icon-xs"
                onClick={() => onRemove(f._id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
