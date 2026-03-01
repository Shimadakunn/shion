"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { logout } from "@/lib/admin-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  UtensilsCrossed,
  CalendarDays,
  Clock,
  Settings,
  ArrowLeft,
  LogOut,
} from "lucide-react";

const navItems = [
  { key: "dashboard", href: "/admin", icon: LayoutDashboard },
  { key: "menu", href: "/admin/menu", icon: UtensilsCrossed },
  { key: "reservations", href: "/admin/reservations", icon: CalendarDays },
  { key: "schedule", href: "/admin/schedule", icon: Clock },
  { key: "settings", href: "/admin/settings", icon: Settings },
] as const;

export function AdminSidebar() {
  const t = useTranslations("admin.nav");
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.refresh();
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-muted/30">
      <div className="p-6">
        <h2 className="text-sm font-semibold tracking-[0.2em] uppercase">
          Shion
        </h2>
        <p className="text-muted-foreground mt-1 text-xs">Admin</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map(({ key, href, icon: Icon }) => {
          const isActive =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);

          return (
            <Link
              key={key}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/10",
              )}
            >
              <Icon className="h-4 w-4" />
              {t(key)}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3 space-y-1">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground flex items-center gap-3 px-3 py-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToSite")}
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-muted-foreground"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
