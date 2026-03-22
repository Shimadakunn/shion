"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const HERO_IMAGE_DESKTOP = "kg29mm3pg2vae8n8tjv0b8hbf183a01w" as Id<"_storage">;
const HERO_IMAGE_MOBILE = "kg2b6hfwksgp3s1abjybscx14183bkr2" as Id<"_storage">;

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
} as const;

export function Hero() {
  const t = useTranslations("hero");
  const tCta = useTranslations("cta");
  const desktopImageUrl = useQuery(api.files.getUrl, {
    storageId: HERO_IMAGE_DESKTOP,
  });
  const mobileImageUrl = useQuery(api.files.getUrl, {
    storageId: HERO_IMAGE_MOBILE,
  });

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center">
      {/* Mobile: vertical image, contained with fading edges */}
      {mobileImageUrl && (
        <div className="absolute inset-0  md:hidden">
          <div
            className="h-full w-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${mobileImageUrl})` }}
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/80" />
          <div className="absolute inset-0 bg-linear-to-l from-black/20 via-transparent to-black/20" />
        </div>
      )}

      {/* Desktop: landscape image, full-bleed */}
      {desktopImageUrl && (
        <div className="absolute inset-0 hidden md:block">
          <div
            className="h-full w-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${desktopImageUrl})` }}
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/80" />
          <div className="absolute inset-0 bg-linear-to-l from-black/10 via-transparent to-black/10" />
        </div>
      )}

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-8 px-6 text-center sm:gap-10"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {/* Award badge */}
        <motion.p
          className="text-primary border-primary/40 rounded-full border px-4 py-1.5 text-[0.65rem] tracking-[0.25em] uppercase sm:text-xs"
          variants={fadeUp}
        >
          {t("bestTable")}
        </motion.p>

        {/* Title block */}
        <motion.div className="space-y-3" variants={fadeUp}>
          <h1 className="text-5xl font-semibold tracking-[0.025em] uppercase sm:text-7xl lg:text-8xl">
            Shion
          </h1>
          <div className="mx-auto h-px w-16 bg-white/30" />
          <p className="text-sm tracking-[0.3em] uppercase text-white/60 sm:text-base">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div variants={fadeUp}>
          <Link
            href="/reservation"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground inline-block rounded-none border px-8 py-3 text-xs tracking-[0.2em] uppercase transition-colors sm:px-10 sm:py-3.5 sm:text-sm"
          >
            {tCta("reserve")}
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-5 w-5 text-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}
