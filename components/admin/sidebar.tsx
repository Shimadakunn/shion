"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { logout } from "@/lib/admin-auth";
import { useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  UtensilsCrossed,
  CalendarDays,
  Clock,
  Settings,
  Mail,
  ArrowLeft,
  LogOut,
} from "lucide-react";

const navItems = [
  {
    key: "reservations",
    href: "/admin/reservations",
    icon: CalendarDays,
    label: "Reservations",
  },
  {
    key: "menu",
    href: "/admin/menu",
    icon: UtensilsCrossed,
    label: "Menu",
  },
  {
    key: "schedule",
    href: "/admin/schedule",
    icon: Clock,
    label: "Schedule",
  },
  {
    key: "settings",
    href: "/admin/settings",
    icon: Settings,
    label: "Settings",
  },
  {
    key: "emails",
    href: "/admin/emails",
    icon: Mail,
    label: "Emails",
  },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.refresh();
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex flex-col px-2 py-1 group-data-[collapsible=icon]:hidden">
          <h2 className="text-sm font-semibold tracking-[0.2em] uppercase">
            Shion
          </h2>
          <p className="text-muted-foreground text-xs">Admin</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(({ key, href, icon: Icon, label }) => {
                const isActive = pathname.startsWith(href);
                return (
                  <SidebarMenuItem key={key}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={label}
                      render={<Link href={href} />}
                    >
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Back to site"
              render={<Link href="/" />}
            >
              <ArrowLeft />
              <span>Back to site</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Logout" onClick={handleLogout}>
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
