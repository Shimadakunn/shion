"use client";

import { useTranslations } from "next-intl";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Id } from "@/convex/_generated/dataModel";

type MenuItem = {
  _id: Id<"menuItems">;
  category: "entrees" | "plats" | "desserts";
  service: "lunch" | "dinner" | "both";
  name: { fr: string; en: string; jp: string };
  description: { fr: string; en: string; jp: string };
  price: number;
  order: number;
  isActive: boolean;
  subcategory?: string;
};

type Props = {
  item?: MenuItem;
  onClose: () => void;
};

export function MenuItemForm({ item, onClose }: Props) {
  const t = useTranslations("admin.menuEditor");
  const create = useMutation(api.menu.create);
  const update = useMutation(api.menu.update);

  const [category, setCategory] = useState<MenuItem["category"]>(
    item?.category ?? "entrees",
  );
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
  const [order, setOrder] = useState(String(item?.order ?? 0));
  const [isActive, setIsActive] = useState(item?.isActive ?? true);
  const [subcategory, setSubcategory] = useState(item?.subcategory ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      category,
      service,
      name: { fr: nameFr, en: nameEn, jp: nameJp },
      description: { fr: descFr, en: descEn, jp: descJp },
      price: Number(price),
      order: Number(order),
      isActive,
      subcategory: subcategory.trim() || undefined,
    };

    if (item) await update({ id: item._id, ...data });
    else await create(data);

    onClose();
  }

  return (
    <div className="border border-border p-6">
      <h3 className="mb-6 text-sm font-medium tracking-wider uppercase">
        {item ? t("editItem") : t("addItem")}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1">{t("category")}</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MenuItem["category"])}
              className="border-input w-full border bg-transparent px-2.5 py-1.5 text-xs"
            >
              <option value="entrees">Entrées</option>
              <option value="plats">Plats</option>
              <option value="desserts">Desserts</option>
            </select>
          </div>
          <div>
            <Label className="mb-1">{t("service")}</Label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value as MenuItem["service"])}
              className="border-input w-full border bg-transparent px-2.5 py-1.5 text-xs"
            >
              <option value="lunch">Midi</option>
              <option value="dinner">Soir</option>
              <option value="both">Les deux</option>
            </select>
          </div>
        </div>

        <div>
          <Label className="mb-1">{t("subcategory")}</Label>
          <Input
            placeholder="ex: Sushi, Maki..."
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
          />
        </div>

        {/* Trilingual name fields */}
        <div className="space-y-2">
          <Label>{t("name")}</Label>
          <div className="grid gap-2 sm:grid-cols-3">
            <Input placeholder="FR" value={nameFr} onChange={(e) => setNameFr(e.target.value)} required />
            <Input placeholder="EN" value={nameEn} onChange={(e) => setNameEn(e.target.value)} required />
            <Input placeholder="JP" value={nameJp} onChange={(e) => setNameJp(e.target.value)} required />
          </div>
        </div>

        {/* Trilingual description fields */}
        <div className="space-y-2">
          <Label>{t("description")}</Label>
          <div className="grid gap-2 sm:grid-cols-3">
            <Textarea placeholder="FR" value={descFr} onChange={(e) => setDescFr(e.target.value)} rows={2} />
            <Textarea placeholder="EN" value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={2} />
            <Textarea placeholder="JP" value={descJp} onChange={(e) => setDescJp(e.target.value)} rows={2} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label className="mb-1">{t("price")}</Label>
            <Input type="number" step="0.5" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div>
            <Label className="mb-1">{t("order")}</Label>
            <Input type="number" value={order} onChange={(e) => setOrder(e.target.value)} />
          </div>
          <div className="flex items-end gap-2 pb-1">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} id="active" />
            <Label htmlFor="active">{t("active")}</Label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit">{t("save")}</Button>
          <Button type="button" variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
        </div>
      </form>
    </div>
  );
}
