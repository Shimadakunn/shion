import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { Resend } from "@convex-dev/resend";

const resend = new Resend(components.resend, { testMode: false });

function getSiteUrl() {
  return process.env.SITE_URL ?? "http://localhost:3000";
}

function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL ?? "Shion <onboarding@resend.dev>";
}

function formatDateLabel(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatCustomerDetailsHtml(reservation: {
  date: string;
  time: string;
  partySize: number;
  notes?: string;
}) {
  return `
    <table style="border-collapse:collapse;width:100%;max-width:400px;margin:16px 0;font-family:sans-serif;font-size:14px">
      <tr><td style="padding:8px 0;color:#666">Date</td><td style="padding:8px 0;text-transform:capitalize">${formatDateLabel(reservation.date)}</td></tr>
      <tr><td style="padding:8px 0;color:#666">Time</td><td style="padding:8px 0">${reservation.time}</td></tr>
      <tr><td style="padding:8px 0;color:#666">Guests</td><td style="padding:8px 0">${reservation.partySize}</td></tr>
      ${reservation.notes ? `<tr><td style="padding:8px 0;color:#666">Notes</td><td style="padding:8px 0;font-style:italic">${reservation.notes}</td></tr>` : ""}
    </table>
  `;
}

function formatAdminDetailsHtml(reservation: {
  name: string;
  date: string;
  time: string;
  partySize: number;
  phone?: string;
  notes?: string;
}) {
  return `
    <table style="border-collapse:collapse;width:100%;max-width:400px;margin:16px 0;font-family:sans-serif;font-size:14px">
      <tr><td style="padding:8px 0;color:#666">Name</td><td style="padding:8px 0;font-weight:600">${reservation.name}</td></tr>
      ${reservation.phone ? `<tr><td style="padding:8px 0;color:#666">Phone</td><td style="padding:8px 0"><a href="tel:${reservation.phone}" style="color:#2563eb;text-decoration:none">${reservation.phone}</a></td></tr>` : ""}
      <tr><td style="padding:8px 0;color:#666">Date</td><td style="padding:8px 0;text-transform:capitalize">${formatDateLabel(reservation.date)}</td></tr>
      <tr><td style="padding:8px 0;color:#666">Time</td><td style="padding:8px 0">${reservation.time}</td></tr>
      <tr><td style="padding:8px 0;color:#666">Guests</td><td style="padding:8px 0">${reservation.partySize}</td></tr>
      ${reservation.notes ? `<tr><td style="padding:8px 0;color:#666">Notes</td><td style="padding:8px 0;font-style:italic">${reservation.notes}</td></tr>` : ""}
    </table>
  `;
}

function managementButton(url: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;margin-bottom:8px">
      <tr>
        <td style="background:#18181b;border-radius:4px;text-align:center">
          <a href="${url}" style="display:block;padding:14px 32px;color:#ffffff;text-decoration:none;font-family:sans-serif;font-size:14px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase">
            Manage reservation
          </a>
        </td>
      </tr>
    </table>
  `;
}

export const sendNewReservationEmails = mutation({
  args: {
    reservationId: v.id("reservations"),
    managementToken: v.string(),
  },
  handler: async (ctx, args) => {
    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation) return;

    const settings = await ctx.db.query("settings").first();
    const siteUrl = getSiteUrl();
    const fromEmail = getFromEmail();
    const manageUrl = `${siteUrl}/fr/reservation/manage?token=${args.managementToken}`;

    await resend.sendEmail(ctx, {
      from: fromEmail,
      to: reservation.email,
      subject: "Shion — Reservation received",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h1 style="font-size:20px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:24px">Shion</h1>
          <p style="font-size:15px;line-height:1.6">Dear ${reservation.name},</p>
          <p style="font-size:15px;line-height:1.6">Your reservation request has been received. The restaurant will confirm or decline your reservation shortly.</p>
          ${managementButton(manageUrl)}
          ${formatCustomerDetailsHtml(reservation)}
          <p style="font-size:13px;color:#888;margin-top:32px">You will receive another email once the restaurant has reviewed your reservation.</p>
        </div>
      `,
    });

    const adminEmail = settings?.reservationEmail ?? settings?.email;
    if (adminEmail) {
      await resend.sendEmail(ctx, {
        from: fromEmail,
        to: adminEmail,
        subject: `New reservation — ${reservation.name} (${reservation.partySize} guests)`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <h1 style="font-size:20px;font-weight:300;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:24px;color:#16a34a">New Reservation</h1>
            <p style="font-size:15px;line-height:1.6">A new reservation request has been submitted and is awaiting your confirmation.</p>
            <a href="${siteUrl}/admin/reservations" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#18181b;color:#fff;text-decoration:none;font-size:14px;letter-spacing:0.1em;text-transform:uppercase">
              View reservations
            </a>
            ${formatAdminDetailsHtml(reservation)}
          </div>
        `,
      });
    }
  },
});

export const sendStatusUpdateEmail = mutation({
  args: {
    reservationId: v.id("reservations"),
    newStatus: v.string(),
  },
  handler: async (ctx, args) => {
    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation) return;

    const siteUrl = getSiteUrl();
    const fromEmail = getFromEmail();
    const manageUrl = reservation.managementToken
      ? `${siteUrl}/fr/reservation/manage?token=${reservation.managementToken}`
      : null;

    const isConfirmed = args.newStatus === "confirmed";
    const subject = isConfirmed
      ? "Shion — Reservation confirmed"
      : "Shion — Reservation cancelled";

    const message = isConfirmed
      ? "Great news! Your reservation has been confirmed. We look forward to welcoming you."
      : "Unfortunately, your reservation has been cancelled. Please contact us if you have any questions or would like to make a new reservation.";

    await resend.sendEmail(ctx, {
      from: fromEmail,
      to: reservation.email,
      subject,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h1 style="font-size:20px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:24px">Shion</h1>
          <p style="font-size:15px;line-height:1.6">Dear ${reservation.name},</p>
          <p style="font-size:15px;line-height:1.6">${message}</p>
          ${isConfirmed && manageUrl ? managementButton(manageUrl) : ""}
          ${formatCustomerDetailsHtml(reservation)}
          <p style="font-size:13px;color:#888;margin-top:32px">Shion — Japanese-French Cuisine</p>
        </div>
      `,
    });
  },
});

export const sendCancellationNotificationToAdmin = mutation({
  args: { reservationId: v.id("reservations") },
  handler: async (ctx, args) => {
    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation) return;

    const settings = await ctx.db.query("settings").first();
    const adminEmail = settings?.reservationEmail ?? settings?.email;
    if (!adminEmail) return;

    const siteUrl = getSiteUrl();
    const fromEmail = getFromEmail();

    await resend.sendEmail(ctx, {
      from: fromEmail,
      to: adminEmail,
      subject: `Reservation cancelled by customer — ${reservation.name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h1 style="font-size:20px;font-weight:300;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:24px;color:#dc2626">Reservation Cancelled</h1>
          <p style="font-size:15px;line-height:1.6">The customer <strong>${reservation.name}</strong> has cancelled their reservation.</p>
          <a href="${siteUrl}/admin/reservations" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#18181b;color:#fff;text-decoration:none;font-size:14px;letter-spacing:0.1em;text-transform:uppercase">
            View reservations
          </a>
          ${formatAdminDetailsHtml(reservation)}
        </div>
      `,
    });
  },
});

export const sendModificationConfirmationToCustomer = mutation({
  args: { reservationId: v.id("reservations") },
  handler: async (ctx, args) => {
    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation) return;

    const siteUrl = getSiteUrl();
    const fromEmail = getFromEmail();
    const manageUrl = reservation.managementToken
      ? `${siteUrl}/fr/reservation/manage?token=${reservation.managementToken}`
      : null;

    await resend.sendEmail(ctx, {
      from: fromEmail,
      to: reservation.email,
      subject: "Shion — Modification request received",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h1 style="font-size:20px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:24px">Shion</h1>
          <p style="font-size:15px;line-height:1.6">Dear ${reservation.name},</p>
          <p style="font-size:15px;line-height:1.6">Your modification request has been received. The restaurant will review the new details and confirm or decline shortly.</p>
          ${manageUrl ? managementButton(manageUrl) : ""}
          ${formatCustomerDetailsHtml(reservation)}
          <p style="font-size:13px;color:#888;margin-top:32px">You will receive another email once the restaurant has reviewed your request.</p>
        </div>
      `,
    });
  },
});

export const sendModificationNotificationToAdmin = mutation({
  args: { reservationId: v.id("reservations") },
  handler: async (ctx, args) => {
    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation) return;

    const settings = await ctx.db.query("settings").first();
    const adminEmail = settings?.reservationEmail ?? settings?.email;
    if (!adminEmail) return;

    const siteUrl = getSiteUrl();
    const fromEmail = getFromEmail();

    await resend.sendEmail(ctx, {
      from: fromEmail,
      to: adminEmail,
      subject: `Modification requested — ${reservation.name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h1 style="font-size:20px;font-weight:300;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:24px;color:#f59e0b">Modification Requested</h1>
          <p style="font-size:15px;line-height:1.6">The customer <strong>${reservation.name}</strong> has requested to modify their reservation. Please review the new details below and confirm or decline.</p>
          <a href="${siteUrl}/admin/reservations" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#18181b;color:#fff;text-decoration:none;font-size:14px;letter-spacing:0.1em;text-transform:uppercase">
            View reservations
          </a>
          ${formatAdminDetailsHtml(reservation)}
        </div>
      `,
    });
  },
});
