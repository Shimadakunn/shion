"use client";

import { useTranslations } from "next-intl";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
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
            <label className="text-muted-foreground mb-1 block text-xs">
              {t("category")}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MenuItem["category"])}
              className="border-border w-full border bg-transparent px-3 py-2 text-sm"
            >
              <option value="entrees">Entrées</option>
              <option value="plats">Plats</option>
              <option value="desserts">Desserts</option>
            </select>
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-xs">
              {t("service")}
            </label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value as MenuItem["service"])}
              className="border-border w-full border bg-transparent px-3 py-2 text-sm"
            >
              <option value="lunch">Midi</option>
              <option value="dinner">Soir</option>
              <option value="both">Les deux</option>
            </select>
          </div>
        </div>

        {/* Trilingual name fields */}
        <div className="space-y-2">
          <label className="text-muted-foreground mb-1 block text-xs">
            {t("name")}
          </label>
          <div className="grid gap-2 sm:grid-cols-3">
            <input
              placeholder="FR"
              value={nameFr}
              onChange={(e) => setNameFr(e.target.value)}
              required
              className="border-border w-full border bg-transparent px-3 py-2 text-sm"
            />
            <input
              placeholder="EN"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              required
              className="border-border w-full border bg-transparent px-3 py-2 text-sm"
            />
            <input
              placeholder="JP"
              value={nameJp}
              onChange={(e) => setNameJp(e.target.value)}
              required
              className="border-border w-full border bg-transparent px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Trilingual description fields */}
        <div className="space-y-2">
          <label className="text-muted-foreground mb-1 block text-xs">
            {t("description")}
          </label>
          <div className="grid gap-2 sm:grid-cols-3">
            <textarea
              placeholder="FR"
              value={descFr}
              onChange={(e) => setDescFr(e.target.value)}
              rows={2}
              className="border-border w-full border bg-transparent px-3 py-2 text-sm"
            />
            <textarea
              placeholder="EN"
              value={descEn}
              onChange={(e) => setDescEn(e.target.value)}
              rows={2}
              className="border-border w-full border bg-transparent px-3 py-2 text-sm"
            />
            <textarea
              placeholder="JP"
              value={descJp}
              onChange={(e) => setDescJp(e.target.value)}
              rows={2}
              className="border-border w-full border bg-transparent px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-muted-foreground mb-1 block text-xs">
              {t("price")}
            </label>
            <input
              type="number"
              step="0.5"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="border-border w-full border bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-muted-foreground mb-1 block text-xs">
              {t("order")}
            </label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="border-border w-full border bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end gap-2 pb-1">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              id="active"
            />
            <label htmlFor="active" className="text-sm">
              {t("active")}
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="bg-foreground text-background px-6 py-2 text-xs font-medium tracking-wider uppercase"
          >
            {t("save")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="border-border text-muted-foreground border px-6 py-2 text-xs font-medium tracking-wider uppercase"
          >
            {t("cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
