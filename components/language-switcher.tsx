"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const localeLabels: Record<string, string> = {
  fr: "FR",
  en: "EN",
  jp: "JP",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleSwitch(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="flex items-center gap-1">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleSwitch(loc)}
          className={cn(
            "px-2 py-1 text-xs font-medium tracking-wider transition-colors",
            loc === locale
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {localeLabels[loc]}
        </button>
      ))}
    </div>
  );
}
