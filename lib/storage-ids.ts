import type { Id } from "@/convex/_generated/dataModel";

type StorageIds = {
  footer: Id<"_storage">;
  menu: Id<"_storage">;
  heroDesktop: Id<"_storage">;
  heroMobile: Id<"_storage">;
};

const ids: Record<string, StorageIds> = {
  dev: {
    footer: "kg20pb1p3e15kf8j30dq4jq1cx83d3zc" as Id<"_storage">,
    menu: "kg25a95k663p6cbgtrzxe2gd3n83abb3" as Id<"_storage">,
    heroDesktop: "kg29mm3pg2vae8n8tjv0b8hbf183a01w" as Id<"_storage">,
    heroMobile: "kg2b6hfwksgp3s1abjybscx14183bkr2" as Id<"_storage">,
  },
  prod: {
    footer: "kg28amc010s2me3v4cyvktgnsn83cy4r" as Id<"_storage">,
    menu: "kg28d3v2npd264kzn90b5b3g0983cmht" as Id<"_storage">,
    heroDesktop: "kg29d3qgqhv7m3vvwh7r61zd6h83ckqd" as Id<"_storage">,
    heroMobile: "kg23zc4k1hprwed78yq3tsgn5n83ctc8" as Id<"_storage">,
  },
};

const env = process.env.NEXT_PUBLIC_ENVIRONMENT ?? "dev";

export const storageIds: StorageIds = ids[env] ?? ids.dev;
