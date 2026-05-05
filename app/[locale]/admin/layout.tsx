import { cookies } from "next/headers";
import { isAuthenticated } from "@/lib/admin-auth";
import { LoginForm } from "@/components/admin/login-form";
import { AdminShell } from "@/components/admin/admin-shell";

type Props = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: Props) {
  const authed = await isAuthenticated();

  if (!authed) return <LoginForm />;

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return <AdminShell defaultOpen={defaultOpen}>{children}</AdminShell>;
}
