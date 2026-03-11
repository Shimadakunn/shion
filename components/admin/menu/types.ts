import type { Id } from "@/convex/_generated/dataModel";

export type MenuItem = {
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

export type CategoryItem = {
  _id: Id<"categories">;
  _creationTime: number;
  name: { fr: string; en: string; jp: string };
  order: number;
  isActive?: boolean;
};

export type SubcategoryItem = {
  _id: Id<"subcategories">;
  _creationTime: number;
  name: { fr: string; en: string; jp: string };
  category: Id<"categories">;
  order: number;
  isActive?: boolean;
};

export type DragType = "item" | "category" | "subcategory";
