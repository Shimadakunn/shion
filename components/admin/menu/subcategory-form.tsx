"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

type Subcategory = {
  _id: Id<"subcategories">;
  name: { fr: string; en: string; jp: string };
  category: Id<"categories">;
  order: number;
};

type Props = {
  subcategory?: Subcategory;
  defaultCategoryId?: Id<"categories">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: () => void;
};

export function SubcategoryForm({
  subcategory,
  defaultCategoryId,
  open,
  onOpenChange,
  onDelete,
}: Props) {
  const create = useMutation(api.subcategories.create);
  const update = useMutation(api.subcategories.update);
  const categories = useQuery(api.categories.getAll);

  const [nameFr, setNameFr] = useState(subcategory?.name.fr ?? "");
  const [nameEn, setNameEn] = useState(subcategory?.name.en ?? "");
  const [nameJp, setNameJp] = useState(subcategory?.name.jp ?? "");
  const [categoryId, setCategoryId] = useState<string>(
    subcategory?.category ?? defaultCategoryId ?? "",
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId) return;

    const name = { fr: nameFr, en: nameEn, jp: nameJp };

    if (subcategory)
      await update({
        id: subcategory._id,
        name,
        category: categoryId as Id<"categories">,
      });
    else
      await create({
        name,
        category: categoryId as Id<"categories">,
      });

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="mb-4">
          {subcategory ? "Edit subcategory" : "Add subcategory"}
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
            {subcategory && onDelete && (
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
