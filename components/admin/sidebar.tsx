"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { logout } from "@/lib/admin-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  UtensilsCrossed,
  CalendarDays,
  Clock,
  Settings,
  ArrowLeft,
  LogOut,
} from "lucide-react";

const navItems = [
  { key: "reservations", href: "/admin/reservations", icon: CalendarDays },
  { key: "menu", href: "/admin/menu", icon: UtensilsCrossed },
  { key: "schedule", href: "/admin/schedule", icon: Clock },
  { key: "settings", href: "/admin/settings", icon: Settings },
] as const;

const NAV_LABELS: Record<string, string> = {
  menu: "Menu",
  reservations: "Reservations",
  schedule: "Schedule",
  settings: "Settings",
};

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.refresh();
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-muted/30">
        <div className="p-6">
          <h2 className="text-sm font-semibold tracking-[0.2em] uppercase">
            Shion
          </h2>
          <p className="text-muted-foreground mt-1 text-xs">Admin</p>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map(({ key, href, icon: Icon }) => {
            const isActive = pathname.startsWith(href);

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
                {NAV_LABELS[key]}
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
            Back to site
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

      {/* Mobile bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-[env(safe-area-inset-bottom)]">
        {navItems.map(({ key, href, icon: Icon }) => {
          const isActive = pathname.startsWith(href);

          return (
            <Link
              key={key}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-[10px] transition-colors",
                isActive
                  ? "text-foreground font-medium"
                  : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {NAV_LABELS[key]}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
