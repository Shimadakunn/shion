import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const trilingualText = {
  fr: v.string(),
  en: v.string(),
  jp: v.string(),
};

export default defineSchema({
  menuItems: defineTable({
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
  })
    .index("by_category", ["category"])
    .index("by_service", ["service"])
    .index("by_order", ["order"]),

  formules: defineTable({
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
  })
    .index("by_service", ["service"])
    .index("by_order", ["order"]),

  schedule: defineTable({
    dayOfWeek: v.number(),
    isOpen: v.boolean(),
    services: v.array(
      v.object({
        name: v.string(),
        openTime: v.string(),
        closeTime: v.string(),
        maxCovers: v.number(),
      }),
    ),
  }).index("by_day", ["dayOfWeek"]),

  specialDates: defineTable({
    date: v.string(),
    isOpen: v.boolean(),
    services: v.optional(
      v.array(
        v.object({
          name: v.string(),
          openTime: v.string(),
          closeTime: v.string(),
          maxCovers: v.number(),
        }),
      ),
    ),
    note: v.optional(v.string()),
  }).index("by_date", ["date"]),

  reservations: defineTable({
    date: v.string(),
    time: v.string(),
    service: v.string(),
    partySize: v.number(),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    status: v.union(
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("no_show"),
      v.literal("completed"),
    ),
    notes: v.optional(v.string()),
  })
    .index("by_date", ["date"])
    .index("by_status", ["status"])
    .index("by_date_service", ["date", "service"]),

  settings: defineTable({
    address: v.string(),
    phone: v.string(),
    email: v.string(),
    socialLinks: v.optional(
      v.object({
        instagram: v.optional(v.string()),
        facebook: v.optional(v.string()),
      }),
    ),
  }),
});
