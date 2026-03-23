"use client";

import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./language-switcher";

export function Header() {
  return (
    <header className="pointer-events-none fixed top-0 z-50 w-full">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 mb-12">
        <Link
          href="/"
          className="pointer-events-auto text-lg font-bold tracking-[0.15em] uppercase"
        >
          Shion
        </Link>

        <LanguageSwitcher />
      </div>
      <div className="absolute inset-0 bg-linear-to-b from-black to-transparent -z-10" />
    </header>
  );
}
