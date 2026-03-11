"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Id } from "@/convex/_generated/dataModel";

type Formule = {
  _id: Id<"formules">;
  service: "lunch" | "dinner" | "both";
  name: { fr: string; en: string; jp: string };
  description: { fr: string; en: string; jp: string };
  price: number;
  includedItemIds: Id<"menuItems">[];
  order: number;
  isActive: boolean;
};

type Props = {
  formule?: Formule;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FormuleForm({ formule, open, onOpenChange }: Props) {
  const create = useMutation(api.formules.create);
  const update = useMutation(api.formules.update);
  const allItems = useQuery(api.menu.getAll);

  const [service, setService] = useState<Formule["service"]>(
    formule?.service ?? "both",
  );
  const [nameFr, setNameFr] = useState(formule?.name.fr ?? "");
  const [nameEn, setNameEn] = useState(formule?.name.en ?? "");
  const [nameJp, setNameJp] = useState(formule?.name.jp ?? "");
  const [descFr, setDescFr] = useState(formule?.description.fr ?? "");
  const [descEn, setDescEn] = useState(formule?.description.en ?? "");
  const [descJp, setDescJp] = useState(formule?.description.jp ?? "");
  const [price, setPrice] = useState(String(formule?.price ?? ""));
  const [order, setOrder] = useState(String(formule?.order ?? 0));
  const [isActive, setIsActive] = useState(formule?.isActive ?? true);
  const [selectedItems, setSelectedItems] = useState<Id<"menuItems">[]>(
    formule?.includedItemIds ?? [],
  );

  function toggleItem(id: Id<"menuItems">) {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      service,
      name: { fr: nameFr, en: nameEn, jp: nameJp },
      description: { fr: descFr, en: descEn, jp: descJp },
      price: Number(price),
      includedItemIds: selectedItems,
      order: Number(order),
      isActive,
    };

    if (formule) await update({ id: formule._id, ...data });
    else await create(data);

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogTitle className="mb-6">
          {formule ? "Edit set menu" : "Add set menu"}
        </DialogTitle>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-1">Service</Label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value as Formule["service"])}
              className="border-input w-full border bg-transparent px-2.5 py-1.5 text-xs"
            >
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="both">Lunch & Dinner</option>
            </select>
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

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label className="mb-1">{"Price (\u20AC)"}</Label>
              <Input
                type="number"
                step="0.5"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="mb-1">Display order</Label>
              <Input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                id="formule-active"
              />
              <Label htmlFor="formule-active">Active</Label>
            </div>
          </div>

          {allItems && (
            <div>
              <Label className="mb-2">Included items</Label>
              <div className="max-h-48 space-y-1 overflow-y-auto border border-border p-3">
                {allItems.map((menuItem) => (
                  <Label key={menuItem._id} className="cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(menuItem._id)}
                      onChange={() => toggleItem(menuItem._id)}
                    />
                    {menuItem.name.fr} — {menuItem.price}€
                  </Label>
                ))}
              </div>
            </div>
          )}

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
