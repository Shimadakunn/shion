"use client";

import { useState } from "react";
import { login } from "@/lib/admin-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
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
          Administration
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-2 tracking-wider uppercase">
              Password
            </Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-destructive text-sm">Incorrect password</p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
