"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { storageIds } from "@/lib/storage-ids";
import shionLogo from "@/lib/shion.png";

export function Footer() {
  const t = useTranslations("footer");
  const settings = useQuery(api.settings.get);
  const imageUrl = useQuery(api.files.getUrl, { storageId: storageIds.footer });

  return (
    <footer className="relative px-6 py-20 ">
      {imageUrl && (
        <>
          <Image src={imageUrl} alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/70" />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black" />
          <div className="absolute inset-0 bg-linear-to-l from-black/20 via-transparent to-black/20" />
        </>
      )}

      {/* Curved top overlay — inverted U, black-to-transparent */}
      <svg
        className="pointer-events-none absolute top-0 left-0 z-10 h-56 w-full sm:h-80"
        viewBox="0 0 1440 600"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="footer-curve" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="black" />
            <stop offset="25%" stopColor="black" stopOpacity="0.4" />
            <stop offset="50%" stopColor="black" stopOpacity="0.08" />
            <stop offset="65%" stopColor="black" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,600 Q720,300 1440,600 L1440,0 L0,0 Z"
          fill="url(#footer-curve)"
        />
      </svg>
      <div className="relative mx-auto grid max-w-4xl gap-6 sm:grid-cols-3 sm:items-center">
        {/* Brand */}
        <Image src={shionLogo} alt="Shion" className="h-auto w-32" />

        {/* Contact */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium tracking-[0.2em] uppercase">
            {t("contact")}
          </h4>
          {settings && (
            <div className="text-muted-foreground text-sm">
              <p>{settings.address}</p>
              <p>{settings.phone}</p>
              <p>{settings.email}</p>
            </div>
          )}
        </div>

        {/* Social */}
        <div className="space-y-2">
          {settings?.socialLinks?.instagram && (
            <a
              href={settings.socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground block text-sm transition-colors"
            >
              Instagram
            </a>
          )}
          {settings?.socialLinks?.facebook && (
            <a
              href={settings.socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground block text-sm transition-colors"
            >
              Facebook
            </a>
          )}
        </div>
      </div>

      <div className="text-muted-foreground relative mx-auto mt-16 max-w-4xl text-center text-xs">
        © {new Date().getFullYear()} Shion. {t("rights")}.
      </div>
    </footer>
  );
}
