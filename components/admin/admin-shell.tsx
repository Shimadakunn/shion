"use client";

import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import {
  AdminHeaderProvider,
  useAdminHeaderContent,
} from "@/components/admin/admin-header";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type AdminShellProps = {
  children: ReactNode;
  defaultOpen: boolean;
};

function AdminChrome({ children, defaultOpen }: AdminShellProps) {
  const header = useAdminHeaderContent();

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3 md:px-4">
          <SidebarTrigger className="shrink-0" />
          {(header?.title || header?.actions) && (
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {header.title && (
                <div className="min-w-0 flex-1">{header.title}</div>
              )}
              {header.actions && (
                <div className="ml-auto flex min-w-0 shrink-0 items-center justify-end">
                  {header.actions}
                </div>
              )}
            </div>
          )}
        </header>
        <div className="min-h-0 flex-1 p-4 md:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function AdminShell(props: AdminShellProps) {
  return (
    <AdminHeaderProvider>
      <AdminChrome {...props} />
    </AdminHeaderProvider>
  );
}
