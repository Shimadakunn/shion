import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAvailableSlots = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const dateObj = new Date(args.date);
    const dayOfWeek = dateObj.getUTCDay();

    // Check special date override first
    const specialDate = await ctx.db
      .query("specialDates")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();

    if (specialDate && !specialDate.isOpen) return { isOpen: false, services: [] };

    // Get default schedule for day
    const schedule = await ctx.db
      .query("schedule")
      .withIndex("by_day", (q) => q.eq("dayOfWeek", dayOfWeek))
      .first();

    if (!schedule || !schedule.isOpen) return { isOpen: false, services: [] };

    const services = specialDate?.services ?? schedule.services;

    // Get existing reservations for this date
    const reservations = await ctx.db
      .query("reservations")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    const activeReservations = reservations.filter(
      (r) => r.status === "confirmed",
    );

    // Generate 15-minute slots for each service
    const result = services.map((svc) => {
      const slots: { time: string; available: boolean }[] = [];
      const [openH, openM] = svc.openTime.split(":").map(Number);
      const [closeH, closeM] = svc.closeTime.split(":").map(Number);
      const openMinutes = openH * 60 + openM;
      const closeMinutes = closeH * 60 + closeM;

      // Last seating is 30 min before close
      const lastSeating = closeMinutes - 30;

      for (let m = openMinutes; m <= lastSeating; m += 15) {
        const h = Math.floor(m / 60);
        const min = m % 60;
        const time = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;

        // Count covers already booked at this time
        const bookedCovers = activeReservations
          .filter((r) => r.service === svc.name && r.time === time)
          .reduce((sum, r) => sum + r.partySize, 0);

        slots.push({
          time,
          available: bookedCovers < svc.maxCovers,
        });
      }

      return {
        name: svc.name,
        openTime: svc.openTime,
        closeTime: svc.closeTime,
        maxCovers: svc.maxCovers,
        slots,
      };
    });

    return { isOpen: true, services: result };
  },
});

export const create = mutation({
  args: {
    date: v.string(),
    time: v.string(),
    service: v.string(),
    partySize: v.number(),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reservations", {
      ...args,
      status: "confirmed",
    });
  },
});

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reservations")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
  },
});

export const getByDateRange = query({
  args: { startDate: v.string(), endDate: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("reservations")
      .withIndex("by_date")
      .collect();

    return all.filter(
      (r) => r.date >= args.startDate && r.date <= args.endDate,
    );
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("reservations"),
    status: v.union(
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("no_show"),
      v.literal("completed"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const update = mutation({
  args: {
    id: v.id("reservations"),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    service: v.optional(v.string()),
    partySize: v.optional(v.number()),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("confirmed"),
        v.literal("cancelled"),
        v.literal("no_show"),
        v.literal("completed"),
      ),
    ),
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
  args: { id: v.id("reservations") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
