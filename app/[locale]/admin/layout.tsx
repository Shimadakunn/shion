import { isAuthenticated } from "@/lib/admin-auth";
import { LoginForm } from "@/components/admin/login-form";
import { AdminSidebar } from "@/components/admin/sidebar";

type Props = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: Props) {
  const authed = await isAuthenticated();

  if (!authed) return <LoginForm />;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-4 pb-20 md:p-8 md:pb-8">{children}</main>
    </div>
  );
}
