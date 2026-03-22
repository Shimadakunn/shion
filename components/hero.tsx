"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { storageIds } from "@/lib/storage-ids";
import Image from "next/image";
import shionLogo from "@/lib/shion.png";

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
    storageId: storageIds.heroDesktop,
  });
  const mobileImageUrl = useQuery(api.files.getUrl, {
    storageId: storageIds.heroMobile,
  });

  return (
    <section className="relative flex h-[95dvh] flex-col items-center justify-center">
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
        <motion.div
          variants={fadeUp}
          className="relative drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]"
        >
          <Image
            src={shionLogo}
            alt="Shion"
            className="h-full w-auto max-w-[500px]"
            priority
          />
        </motion.div>
        <motion.p
          variants={fadeUp}
          className="text-sm tracking-[0.2em] font-light uppercase text-white/70 sm:text-base md:text-lg"
        >
          {t("description")}
        </motion.p>
      </motion.div>

      {/* Curved bottom overlay — concave U-shape, black-to-transparent */}
      <svg
        className="absolute bottom-0 left-0 z-10 h-56 w-full sm:h-80"
        viewBox="0 0 1440 600"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="hero-curve" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="black" />
            <stop offset="25%" stopColor="black" stopOpacity="0.4" />
            <stop offset="50%" stopColor="black" stopOpacity="0.08" />
            <stop offset="65%" stopColor="black" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,0 Q720,300 1440,0 L1440,600 L0,600 Z"
          fill="url(#hero-curve)"
        />
      </svg>

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
