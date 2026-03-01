import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const trilingualText = {
  fr: v.string(),
  en: v.string(),
  jp: v.string(),
};

export const getActiveFormules = query({
  args: { service: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let formules = await ctx.db
      .query("formules")
      .withIndex("by_order")
      .collect();

    formules = formules.filter((f) => f.isActive);

    if (args.service)
      formules = formules.filter(
        (f) => f.service === args.service || f.service === "both",
      );

    return formules;
  },
});

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("formules").withIndex("by_order").collect();
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
    includedItemIds: v.array(v.id("menuItems")),
    order: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("formules", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("formules"),
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
    includedItemIds: v.optional(v.array(v.id("menuItems"))),
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
  args: { id: v.id("formules") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
