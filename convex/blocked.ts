import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("blockedShifts").withIndex("by_date").collect();
  },
});

export const getByDateRange = query({
  args: { startDate: v.string(), endDate: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("blockedShifts").withIndex("by_date").collect();
    return all.filter((b) => b.date >= args.startDate && b.date <= args.endDate);
  },
});

export const add = mutation({
  args: {
    date: v.string(),
    service: v.string(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("blockedShifts", args);
  },
});

export const remove = mutation({
  args: { id: v.id("blockedShifts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
