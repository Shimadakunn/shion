"use client";

import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminSettingsPage() {
  const t = useTranslations("admin.settings");
  const settings = useQuery(api.settings.get);
  const upsert = useMutation(api.settings.upsert);

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setAddress(settings.address);
      setPhone(settings.phone);
      setEmail(settings.email);
      setGoogleMapsUrl(settings.googleMapsUrl ?? "");
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
      googleMapsUrl: googleMapsUrl || undefined,
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
          <Label className="mb-1">{t("address")}</Label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        <div>
          <Label className="mb-1">{t("phone")}</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div>
          <Label className="mb-1">{t("email")}</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div>
          <Label className="mb-1">{t("googleMapsUrl")}</Label>
          <Input
            value={googleMapsUrl}
            onChange={(e) => setGoogleMapsUrl(e.target.value)}
            placeholder="https://maps.google.com/..."
          />
        </div>

        <div>
          <Label className="mb-1">{t("instagram")}</Label>
          <Input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="https://instagram.com/..."
          />
        </div>

        <div>
          <Label className="mb-1">{t("facebook")}</Label>
          <Input
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="https://facebook.com/..."
          />
        </div>

        <div className="flex items-center gap-4 pt-2">
          <Button type="submit">{t("save")}</Button>
          {saved && (
            <span className="text-sm text-green-600">Saved</span>
          )}
        </div>
      </form>
    </div>
  );
}
