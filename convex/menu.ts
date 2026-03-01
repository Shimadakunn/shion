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
    category: v.union(
      v.literal("entrees"),
      v.literal("plats"),
      v.literal("desserts"),
    ),
    service: v.union(
      v.literal("lunch"),
      v.literal("dinner"),
      v.literal("both"),
    ),
    name: v.object(trilingualText),
    description: v.object(trilingualText),
    price: v.number(),
    order: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("menuItems", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("menuItems"),
    category: v.optional(
      v.union(
        v.literal("entrees"),
        v.literal("plats"),
        v.literal("desserts"),
      ),
    ),
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
