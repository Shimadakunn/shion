import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const trilingualText = {
  fr: v.string(),
  en: v.string(),
  jp: v.string(),
};

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("subcategories").withIndex("by_order").collect();
  },
});

export const getActive = query({
  handler: async (ctx) => {
    const all = await ctx.db
      .query("subcategories")
      .withIndex("by_order")
      .collect();
    return all.filter((s) => s.isActive !== false);
  },
});

export const create = mutation({
  args: {
    name: v.object(trilingualText),
    category: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const siblings = await ctx.db
      .query("subcategories")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
    const maxOrder = siblings.reduce((max, s) => Math.max(max, s.order), -1);
    return await ctx.db.insert("subcategories", {
      ...args,
      order: maxOrder + 1,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("subcategories"),
    name: v.optional(v.object(trilingualText)),
    category: v.optional(v.id("categories")),
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
  args: { id: v.id("subcategories") },
  handler: async (ctx, args) => {
    const items = await ctx.db.query("menuItems").collect();
    const usedBy = items.filter((i) => i.subcategory === args.id);
    if (usedBy.length > 0)
      throw new Error(
        `Cannot delete: ${usedBy.length} plate(s) still use this subcategory`,
      );
    await ctx.db.delete(args.id);
  },
});

export const reorder = mutation({
  args: {
    orderedIds: v.array(v.id("subcategories")),
  },
  handler: async (ctx, args) => {
    for (let i = 0; i < args.orderedIds.length; i++) {
      await ctx.db.patch(args.orderedIds[i], { order: i });
    }
  },
});
