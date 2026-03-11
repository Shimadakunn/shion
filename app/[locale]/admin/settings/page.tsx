"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminSettingsPage() {
  const settings = useQuery(api.settings.get);
  const upsert = useMutation(api.settings.upsert);

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [reservationEmail, setReservationEmail] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setAddress(settings.address);
      setPhone(settings.phone);
      setEmail(settings.email);
      setReservationEmail(settings.reservationEmail ?? "");
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
      reservationEmail: reservationEmail || undefined,
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
        Settings
      </h1>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <Label className="mb-1">Address</Label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        <div>
          <Label className="mb-1">Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div>
          <Label className="mb-1">Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div>
          <Label className="mb-1">Reservation notification email</Label>
          <Input
            type="email"
            value={reservationEmail}
            onChange={(e) => setReservationEmail(e.target.value)}
            placeholder="Leave empty to use the main email"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Email that receives reservation notifications. Falls back to the main email above.
          </p>
        </div>

        <div>
          <Label className="mb-1">Google Maps link</Label>
          <Input
            value={googleMapsUrl}
            onChange={(e) => setGoogleMapsUrl(e.target.value)}
            placeholder="https://maps.google.com/..."
          />
        </div>

        <div>
          <Label className="mb-1">Instagram</Label>
          <Input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="https://instagram.com/..."
          />
        </div>

        <div>
          <Label className="mb-1">Facebook</Label>
          <Input
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="https://facebook.com/..."
          />
        </div>

        <div className="flex items-center gap-4 pt-2">
          <Button type="submit">Save</Button>
          {saved && (
            <span className="text-sm text-green-600">Saved</span>
          )}
        </div>
      </form>
    </div>
  );
}
