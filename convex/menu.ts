import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const trilingualText = {
  fr: v.string(),
  en: v.string(),
  jp: v.string(),
};

export const getActiveItems = query({
  args: { service: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let items = await ctx.db
      .query("menuItems")
      .withIndex("by_order")
      .collect();

    items = items.filter((item) => item.isActive);

    if (args.service)
      items = items.filter(
        (item) => item.service === args.service || item.service === "both",
      );

    return items;
  },
});

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("menuItems").withIndex("by_order").collect();
  },
});

export const create = mutation({
  args: {
    service: v.union(
      v.literal("lunch"),
      v.literal("dinner"),
      v.literal("both"),
    ),
    name: v.object(trilingualText),
    description: v.object(trilingualText),
    price: v.number(),
    isActive: v.boolean(),
    category: v.id("categories"),
    subcategory: v.optional(v.id("subcategories")),
  },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("menuItems").collect();
    const maxOrder = all.reduce((max, item) => Math.max(max, item.order), -1);
    return await ctx.db.insert("menuItems", { ...args, order: maxOrder + 1 });
  },
});

export const update = mutation({
  args: {
    id: v.id("menuItems"),
    service: v.optional(
      v.union(
        v.literal("lunch"),
        v.literal("dinner"),
        v.literal("both"),
      ),
    ),
    name: v.optional(v.object(trilingualText)),
    description: v.optional(v.object(trilingualText)),
    price: v.optional(v.number()),
    order: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    category: v.optional(v.id("categories")),
    subcategory: v.optional(v.id("subcategories")),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const reorder = mutation({
  args: {
    items: v.array(
      v.object({
        id: v.id("menuItems"),
        order: v.number(),
        category: v.id("categories"),
        subcategory: v.optional(v.id("subcategories")),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const item of args.items) {
      await ctx.db.patch(item.id, {
        order: item.order,
        category: item.category,
        subcategory: item.subcategory,
      });
    }
  },
});
