"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function Footer() {
  const t = useTranslations("footer");
  const settings = useQuery(api.settings.get);

  return (
    <footer className="border-t border-border px-6 py-20">
      <div className="mx-auto grid max-w-4xl gap-12 sm:grid-cols-3">
        {/* Brand */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold tracking-[0.3em] uppercase">
            Shion
          </h3>
          <p className="text-muted-foreground text-sm">
            Cuisine franco-japonaise
          </p>
        </div>

        {/* Contact */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium tracking-[0.2em] uppercase">
            {t("contact")}
          </h4>
          {settings && (
            <div className="text-muted-foreground space-y-2 text-sm">
              <p>{settings.address}</p>
              <p>{settings.phone}</p>
              <p>{settings.email}</p>
            </div>
          )}
        </div>

        {/* Social */}
        <div className="space-y-3">
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

      <div className="text-muted-foreground mx-auto mt-16 max-w-4xl text-center text-xs">
        © {new Date().getFullYear()} Shion. {t("rights")}.
      </div>
    </footer>
  );
}
