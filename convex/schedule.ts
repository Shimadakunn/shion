import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const serviceValidator = v.object({
  name: v.string(),
  openTime: v.string(),
  closeTime: v.string(),
  maxCovers: v.number(),
});

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("schedule")
      .withIndex("by_day")
      .collect();
  },
});

export const getForDay = query({
  args: { dayOfWeek: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("schedule")
      .withIndex("by_day", (q) => q.eq("dayOfWeek", args.dayOfWeek))
      .first();
  },
});

export const upsert = mutation({
  args: {
    dayOfWeek: v.number(),
    isOpen: v.boolean(),
    services: v.array(serviceValidator),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("schedule")
      .withIndex("by_day", (q) => q.eq("dayOfWeek", args.dayOfWeek))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isOpen: args.isOpen,
        services: args.services,
      });
      return existing._id;
    }
    return await ctx.db.insert("schedule", args);
  },
});

// Special dates
export const getSpecialDates = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("specialDates")
      .withIndex("by_date")
      .collect();
  },
});

export const getSpecialDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("specialDates")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();
  },
});

export const upsertSpecialDate = mutation({
  args: {
    date: v.string(),
    isOpen: v.boolean(),
    services: v.optional(v.array(serviceValidator)),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("specialDates")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("specialDates", args);
  },
});

export const removeSpecialDate = mutation({
  args: { id: v.id("specialDates") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
