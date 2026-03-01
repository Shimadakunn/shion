"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

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
    <div className="flex items-center gap-0.5">
      {routing.locales.map((loc) => (
        <Button
          key={loc}
          variant="ghost"
          size="xs"
          onClick={() => handleSwitch(loc)}
          className={
            loc === locale
              ? "text-foreground"
              : "text-muted-foreground"
          }
        >
          {localeLabels[loc]}
        </Button>
      ))}
    </div>
  );
}
