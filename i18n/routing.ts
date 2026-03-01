import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en", "jp"],
  defaultLocale: "fr",
  localePrefix: "always",
});
