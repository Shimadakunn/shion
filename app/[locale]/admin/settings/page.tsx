"use client";

import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";

export default function AdminSettingsPage() {
  const t = useTranslations("admin.settings");
  const settings = useQuery(api.settings.get);
  const upsert = useMutation(api.settings.upsert);

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setAddress(settings.address);
      setPhone(settings.phone);
      setEmail(settings.email);
      setInstagram(settings.socialLinks?.instagram ?? "");
      setFacebook(settings.socialLinks?.facebook ?? "");
    }
  }, [settings]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await upsert({
      address,
      phone,
      email,
      socialLinks: {
        instagram: instagram || undefined,
        facebook: facebook || undefined,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <h1 className="mb-8 text-xl font-light tracking-[0.2em] uppercase">
        {t("title")}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <label className="text-muted-foreground mb-1 block text-xs">
            {t("address")}
          </label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="border-border w-full border bg-transparent px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-muted-foreground mb-1 block text-xs">
            {t("phone")}
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border-border w-full border bg-transparent px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-muted-foreground mb-1 block text-xs">
            {t("email")}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-border w-full border bg-transparent px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-muted-foreground mb-1 block text-xs">
            {t("instagram")}
          </label>
          <input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="https://instagram.com/..."
            className="border-border w-full border bg-transparent px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-muted-foreground mb-1 block text-xs">
            {t("facebook")}
          </label>
          <input
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="https://facebook.com/..."
            className="border-border w-full border bg-transparent px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            className="bg-foreground text-background px-6 py-2 text-xs font-medium tracking-wider uppercase"
          >
            {t("save")}
          </button>
          {saved && (
            <span className="text-sm text-green-600">Saved</span>
          )}
        </div>
      </form>
    </div>
  );
}
