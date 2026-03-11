"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

type Category = {
  _id: Id<"categories">;
  name: { fr: string; en: string; jp: string };
  order: number;
};

type Props = {
  category?: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: () => void;
};

export function CategoryForm({
  category,
  open,
  onOpenChange,
  onDelete,
}: Props) {
  const create = useMutation(api.categories.create);
  const update = useMutation(api.categories.update);

  const [nameFr, setNameFr] = useState(category?.name.fr ?? "");
  const [nameEn, setNameEn] = useState(category?.name.en ?? "");
  const [nameJp, setNameJp] = useState(category?.name.jp ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = { fr: nameFr, en: nameEn, jp: nameJp };

    if (category) await update({ id: category._id, name });
    else await create({ name });

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="mb-4">
          {category ? "Edit category" : "Add category"}
        </DialogTitle>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label>Name</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              <Input
                placeholder="FR"
                value={nameFr}
                onChange={(e) => setNameFr(e.target.value)}
                required
              />
              <Input
                placeholder="EN"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                required
              />
              <Input
                placeholder="JP"
                value={nameJp}
                onChange={(e) => setNameJp(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" size="sm">
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            {category && onDelete && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onDelete}
                className="ml-auto"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
