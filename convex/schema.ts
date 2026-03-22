import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const trilingualText = {
  fr: v.string(),
  en: v.string(),
  jp: v.string(),
};

export default defineSchema({
  categories: defineTable({
    name: v.object(trilingualText),
    order: v.number(),
    isActive: v.optional(v.boolean()),
  }).index("by_order", ["order"]),

  subcategories: defineTable({
    name: v.object(trilingualText),
    category: v.id("categories"),
    order: v.number(),
    isActive: v.optional(v.boolean()),
  })
    .index("by_category", ["category"])
    .index("by_order", ["order"]),

  menuItems: defineTable({
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
    category: v.id("categories"),
    subcategory: v.optional(v.id("subcategories")),
  })
    .index("by_category", ["category"])
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
    phone: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("no_show"),
      v.literal("completed"),
    ),
    managementToken: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_date", ["date"])
    .index("by_status", ["status"])
    .index("by_date_service", ["date", "service"])
    .index("by_management_token", ["managementToken"]),

  settings: defineTable({
    address: v.string(),
    phone: v.string(),
    email: v.string(),
    reservationEmail: v.optional(v.string()),
    googleMapsUrl: v.optional(v.string()),
    socialLinks: v.optional(
      v.object({
        instagram: v.optional(v.string()),
        facebook: v.optional(v.string()),
      }),
    ),
  }),
});
