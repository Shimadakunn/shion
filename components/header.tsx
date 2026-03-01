"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./language-switcher";
import { buttonVariants } from "@/components/ui/button";

export function Header() {
  const t = useTranslations("header");

  return (
    <header className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold tracking-[0.3em] uppercase">
          Shion
        </Link>

        <div className="flex items-center gap-6">
          <LanguageSwitcher />
          <Link
            href="/reservation"
            className={buttonVariants({ variant: "outline", size: "default" })}
          >
            {t("reserve")}
          </Link>
        </div>
      </div>
    </header>
  );
}
