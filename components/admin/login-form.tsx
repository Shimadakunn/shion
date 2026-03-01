"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { login } from "@/lib/admin-auth";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const t = useTranslations("admin.login");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const success = await login(password);
    if (success) {
      router.refresh();
    } else {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-lg font-semibold tracking-[0.3em] uppercase">
          {t("title")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium tracking-wider uppercase">
              {t("password")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-border focus:ring-foreground w-full border bg-transparent px-4 py-3 text-sm outline-none focus:ring-1"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-destructive text-sm">{t("error")}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-foreground text-background hover:bg-foreground/90 w-full px-6 py-3 text-xs font-medium tracking-wider uppercase transition-colors disabled:opacity-50"
          >
            {t("submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
