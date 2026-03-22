"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const MOCK = {
  name: "Tanaka Yuki",
  email: "tanaka@example.com",
  date: "2026-04-15",
  time: "19:30",
  service: "Dinner",
  partySize: 4,
  notes: "Window seat preferred, one guest has a nut allergy.",
  managementToken: "preview-token",
};

const SITE_URL = "http://localhost:3000";

function formatDateLabel(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function customerDetailsHtml(r: typeof MOCK) {
  return `
    <table style="border-collapse:collapse;width:100%;max-width:400px;margin:16px 0;font-family:sans-serif;font-size:14px">
      <tr><td style="padding:8px 0;color:#666">Date</td><td style="padding:8px 0;text-transform:capitalize">${formatDateLabel(r.date)}</td></tr>
      <tr><td style="padding:8px 0;color:#666">Time</td><td style="padding:8px 0">${r.time}</td></tr>
      <tr><td style="padding:8px 0;color:#666">Guests</td><td style="padding:8px 0">${r.partySize}</td></tr>
      ${r.notes ? `<tr><td style="padding:8px 0;color:#666">Notes</td><td style="padding:8px 0;font-style:italic">${r.notes}</td></tr>` : ""}
    </table>`;
}

function adminDetailsHtml(r: typeof MOCK) {
  return `
    <table style="border-collapse:collapse;width:100%;max-width:400px;margin:16px 0;font-family:sans-serif;font-size:14px">
      <tr><td style="padding:8px 0;color:#666">Name</td><td style="padding:8px 0;font-weight:600">${r.name}</td></tr>
      <tr><td style="padding:8px 0;color:#666">Date</td><td style="padding:8px 0;text-transform:capitalize">${formatDateLabel(r.date)}</td></tr>
      <tr><td style="padding:8px 0;color:#666">Time</td><td style="padding:8px 0">${r.time}</td></tr>
      <tr><td style="padding:8px 0;color:#666">Guests</td><td style="padding:8px 0">${r.partySize}</td></tr>
      ${r.notes ? `<tr><td style="padding:8px 0;color:#666">Notes</td><td style="padding:8px 0;font-style:italic">${r.notes}</td></tr>` : ""}
    </table>`;
}

function managementBtn(url: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;margin-bottom:8px">
      <tr>
        <td style="background:#18181b;border-radius:4px;text-align:center">
          <a href="${url}" style="display:block;padding:14px 32px;color:#ffffff;text-decoration:none;font-family:sans-serif;font-size:14px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase">
            Manage reservation
          </a>
        </td>
      </tr>
    </table>`;
}

function adminActionBtn() {
  return `
    <a href="${SITE_URL}/admin/reservations" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#18181b;color:#fff;text-decoration:none;font-size:14px;letter-spacing:0.1em;text-transform:uppercase">
      View reservations
    </a>`;
}

const TEMPLATES: Record<string, { label: string; subject: string; html: string }> = {
  newCustomer: {
    label: "New reservation (customer)",
    subject: "Shion — Reservation received",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h1 style="font-size:20px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:24px">Shion</h1>
        <p style="font-size:15px;line-height:1.6">Dear ${MOCK.name},</p>
        <p style="font-size:15px;line-height:1.6">Your reservation request has been received. The restaurant will confirm or decline your reservation shortly.</p>
        ${managementBtn(`${SITE_URL}/fr/reservation/manage?token=${MOCK.managementToken}`)}
        ${customerDetailsHtml(MOCK)}
        <p style="font-size:13px;color:#888;margin-top:32px">You will receive another email once the restaurant has reviewed your reservation.</p>
      </div>`,
  },
  newAdmin: {
    label: "New reservation (admin)",
    subject: `New reservation — ${MOCK.name} (${MOCK.partySize} guests)`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h1 style="font-size:20px;font-weight:300;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:24px;color:#16a34a">New Reservation</h1>
        <p style="font-size:15px;line-height:1.6">A new reservation request has been submitted and is awaiting your confirmation.</p>
        ${adminActionBtn()}
        ${adminDetailsHtml(MOCK)}
      </div>`,
  },
  confirmed: {
    label: "Reservation confirmed",
    subject: "Shion — Reservation confirmed",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h1 style="font-size:20px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:24px">Shion</h1>
        <p style="font-size:15px;line-height:1.6">Dear ${MOCK.name},</p>
        <p style="font-size:15px;line-height:1.6">Great news! Your reservation has been confirmed. We look forward to welcoming you.</p>
        ${managementBtn(`${SITE_URL}/fr/reservation/manage?token=${MOCK.managementToken}`)}
        ${customerDetailsHtml(MOCK)}
        <p style="font-size:13px;color:#888;margin-top:32px">Shion — Japanese-French Cuisine</p>
      </div>`,
  },
  cancelled: {
    label: "Reservation cancelled",
    subject: "Shion — Reservation cancelled",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h1 style="font-size:20px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:24px">Shion</h1>
        <p style="font-size:15px;line-height:1.6">Dear ${MOCK.name},</p>
        <p style="font-size:15px;line-height:1.6">Unfortunately, your reservation has been cancelled. Please contact us if you have any questions or would like to make a new reservation.</p>
        ${customerDetailsHtml(MOCK)}
        <p style="font-size:13px;color:#888;margin-top:32px">Shion — Japanese-French Cuisine</p>
      </div>`,
  },
  cancelledAdmin: {
    label: "Cancellation (admin)",
    subject: `Reservation cancelled by customer — ${MOCK.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h1 style="font-size:20px;font-weight:300;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:24px;color:#dc2626">Reservation Cancelled</h1>
        <p style="font-size:15px;line-height:1.6">The customer <strong>${MOCK.name}</strong> has cancelled their reservation.</p>
        ${adminActionBtn()}
        ${adminDetailsHtml(MOCK)}
      </div>`,
  },
  modificationCustomer: {
    label: "Modification (customer)",
    subject: "Shion — Modification request received",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h1 style="font-size:20px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:24px">Shion</h1>
        <p style="font-size:15px;line-height:1.6">Dear ${MOCK.name},</p>
        <p style="font-size:15px;line-height:1.6">Your modification request has been received. The restaurant will review the new details and confirm or decline shortly.</p>
        ${managementBtn(`${SITE_URL}/fr/reservation/manage?token=${MOCK.managementToken}`)}
        ${customerDetailsHtml(MOCK)}
        <p style="font-size:13px;color:#888;margin-top:32px">You will receive another email once the restaurant has reviewed your request.</p>
      </div>`,
  },
  modificationAdmin: {
    label: "Modification (admin)",
    subject: `Modification requested — ${MOCK.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h1 style="font-size:20px;font-weight:300;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:24px;color:#f59e0b">Modification Requested</h1>
        <p style="font-size:15px;line-height:1.6">The customer <strong>${MOCK.name}</strong> has requested to modify their reservation. Please review the new details below and confirm or decline.</p>
        ${adminActionBtn()}
        ${adminDetailsHtml(MOCK)}
      </div>`,
  },
};

const TEMPLATE_KEYS = Object.keys(TEMPLATES);

export default function EmailPreviewPage() {
  const [selected, setSelected] = useState(TEMPLATE_KEYS[0]);
  const tpl = TEMPLATES[selected];

  return (
    <div>
      <h1 className="mb-8 text-xl font-light tracking-[0.2em] uppercase">
        Email Preview
      </h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {TEMPLATE_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setSelected(key)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm transition-colors",
              selected === key
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground/50",
            )}
          >
            {TEMPLATES[key].label}
          </button>
        ))}
      </div>

      <div className="mb-4 rounded-md border border-border bg-muted/30 px-4 py-3">
        <p className="text-muted-foreground text-xs uppercase tracking-wider">
          Subject
        </p>
        <p className="mt-1 text-sm font-medium">{tpl.subject}</p>
      </div>

      <div className="overflow-hidden rounded-md border border-border">
        <iframe
          key={selected}
          srcDoc={tpl.html}
          title={tpl.label}
          className="h-[600px] w-full bg-white"
          sandbox=""
        />
      </div>

      <p className="text-muted-foreground mt-4 text-xs">
        This preview uses mock data. Links and buttons are non-functional.
      </p>
    </div>
  );
}
