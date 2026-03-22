"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Id } from "@/convex/_generated/dataModel";

type MenuItem = {
  _id: Id<"menuItems">;
  service: "lunch" | "dinner" | "both";
  name: { fr: string; en: string; jp: string };
  description: { fr: string; en: string; jp: string };
  price: number;
  order: number;
  isActive: boolean;
  category: Id<"categories">;
  subcategory?: Id<"subcategories">;
};

type Props = {
  item?: MenuItem;
  defaultCategoryId?: Id<"categories">;
  defaultSubcategoryId?: Id<"subcategories">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MenuItemForm({
  item,
  defaultCategoryId,
  defaultSubcategoryId,
  open,
  onOpenChange,
}: Props) {
  const create = useMutation(api.menu.create);
  const update = useMutation(api.menu.update);

  const [service, setService] = useState<MenuItem["service"]>(
    item?.service ?? "both",
  );
  const [nameFr, setNameFr] = useState(item?.name.fr ?? "");
  const [nameEn, setNameEn] = useState(item?.name.en ?? "");
  const [nameJp, setNameJp] = useState(item?.name.jp ?? "");
  const [descFr, setDescFr] = useState(item?.description.fr ?? "");
  const [descEn, setDescEn] = useState(item?.description.en ?? "");
  const [descJp, setDescJp] = useState(item?.description.jp ?? "");
  const [price, setPrice] = useState(String(item?.price ?? ""));
  const [isActive] = useState(item?.isActive ?? true);
  const [category] = useState<string>(
    item?.category ?? defaultCategoryId ?? "",
  );
  const [subcategory] = useState<string>(
    item?.subcategory ?? defaultSubcategoryId ?? "",
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) return;

    const data = {
      service,
      name: { fr: nameFr, en: nameEn, jp: nameJp },
      description: { fr: descFr, en: descEn, jp: descJp },
      price: Number(price),
      isActive,
      category: category as Id<"categories">,
      subcategory: (subcategory as Id<"subcategories">) || undefined,
    };

    if (item) await update({ id: item._id, ...data });
    else await create(data);

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="mb-6">
          {item ? "Edit plate" : "Add plate"}
        </DialogTitle>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1">Service</Label>
              <select
                value={service}
                onChange={(e) =>
                  setService(e.target.value as MenuItem["service"])
                }
                className="border-input w-full border bg-transparent px-2.5 py-1.5 text-xs"
              >
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="both">Lunch & Dinner</option>
              </select>
            </div>
            <div>
              <Label className="mb-1">Price (&euro;)</Label>
              <Input
                type="number"
                step="0.5"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
          </div>

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

          <div className="space-y-2">
            <Label>Description</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              <Textarea
                placeholder="FR"
                value={descFr}
                onChange={(e) => setDescFr(e.target.value)}
                rows={2}
              />
              <Textarea
                placeholder="EN"
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                rows={2}
              />
              <Textarea
                placeholder="JP"
                value={descJp}
                onChange={(e) => setDescJp(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit">Save</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
