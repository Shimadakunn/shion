import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

function generateToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let token = "";
  for (let i = 0; i < 32; i++)
    token += chars[Math.floor(Math.random() * chars.length)];
  return token;
}

export const getAvailableSlots = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const dateObj = new Date(args.date);
    const dayOfWeek = dateObj.getUTCDay();

    const specialDate = await ctx.db
      .query("specialDates")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();

    if (specialDate && !specialDate.isOpen) return { isOpen: false, services: [] };

    const schedule = await ctx.db
      .query("schedule")
      .withIndex("by_day", (q) => q.eq("dayOfWeek", dayOfWeek))
      .first();

    if (!schedule || !schedule.isOpen) return { isOpen: false, services: [] };

    const services = specialDate?.services ?? schedule.services;

    const reservations = await ctx.db
      .query("reservations")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    const activeReservations = reservations.filter(
      (r) => r.status === "confirmed" || r.status === "pending",
    );

    const result = services.map((svc) => {
      const slots: { time: string; available: boolean }[] = [];
      const [openH, openM] = svc.openTime.split(":").map(Number);
      const [closeH, closeM] = svc.closeTime.split(":").map(Number);
      const openMinutes = openH * 60 + openM;
      const closeMinutes = closeH * 60 + closeM;

      const lastSeating = closeMinutes - 30;

      for (let m = openMinutes; m <= lastSeating; m += 15) {
        const h = Math.floor(m / 60);
        const min = m % 60;
        const time = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;

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
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const managementToken = generateToken();
    const id = await ctx.db.insert("reservations", {
      ...args,
      status: "pending",
      managementToken,
    });
    return { id, managementToken };
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
      v.literal("pending"),
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
    notes: v.optional(v.string()),
    email: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("pending"),
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

export const getById = query({
  args: { id: v.id("reservations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const reservation = await ctx.db
      .query("reservations")
      .withIndex("by_management_token", (q) => q.eq("managementToken", args.token))
      .first();
    if (!reservation) return null;
    const { managementToken: _managementToken, ...safe } = reservation;
    return safe;
  },
});

export const cancelByToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const reservation = await ctx.db
      .query("reservations")
      .withIndex("by_management_token", (q) => q.eq("managementToken", args.token))
      .first();
    if (!reservation) return { success: false, error: "not_found" } as const;
    if (reservation.status === "cancelled")
      return { success: false, error: "already_cancelled" } as const;
    if (reservation.status === "completed" || reservation.status === "no_show")
      return { success: false, error: "past_reservation" } as const;

    await ctx.db.patch(reservation._id, { status: "cancelled" });
    return { success: true, reservationId: reservation._id } as const;
  },
});

export const requestModificationByToken = mutation({
  args: {
    token: v.string(),
    date: v.string(),
    time: v.string(),
    service: v.string(),
    partySize: v.number(),
  },
  handler: async (ctx, args) => {
    const reservation = await ctx.db
      .query("reservations")
      .withIndex("by_management_token", (q) => q.eq("managementToken", args.token))
      .first();
    if (!reservation) return { success: false, error: "not_found" } as const;
    if (reservation.status === "cancelled" || reservation.status === "completed" || reservation.status === "no_show")
      return { success: false, error: "cannot_modify" } as const;

    await ctx.db.patch(reservation._id, {
      date: args.date,
      time: args.time,
      service: args.service,
      partySize: args.partySize,
      status: "pending",
    });
    return { success: true, reservationId: reservation._id } as const;
  },
});
