"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";
import { api } from "./_generated/api";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY environment variable is not set");
  return new Resend(apiKey);
}

function formatReservationHtml(reservation: {
  name: string;
  email: string;
  date: string;
  time: string;
  service: string;
  partySize: number;
  notes?: string;
}) {
  const dateObj = new Date(reservation.date);
  const dateLabel = dateObj.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `
    <table style="border-collapse:collapse;width:100%;max-width:400px;margin:16px 0;font-family:sans-serif;font-size:14px">
      <tr><td style="padding:8px 0;color:#666">Name</td><td style="padding:8px 0;font-weight:600">${reservation.name}</td></tr>
      <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0">${reservation.email}</td></tr>
      <tr><td style="padding:8px 0;color:#666">Date</td><td style="padding:8px 0;text-transform:capitalize">${dateLabel}</td></tr>
      <tr><td style="padding:8px 0;color:#666">Time</td><td style="padding:8px 0">${reservation.time}</td></tr>
      <tr><td style="padding:8px 0;color:#666">Service</td><td style="padding:8px 0">${reservation.service}</td></tr>
      <tr><td style="padding:8px 0;color:#666">Guests</td><td style="padding:8px 0">${reservation.partySize}</td></tr>
      ${reservation.notes ? `<tr><td style="padding:8px 0;color:#666">Notes</td><td style="padding:8px 0;font-style:italic">${reservation.notes}</td></tr>` : ""}
    </table>
  `;
}

export const sendNewReservationEmails = action({
  args: { reservationId: v.id("reservations") },
  handler: async (ctx, args) => {
    const reservation = await ctx.runQuery(api.reservations.getById, { id: args.reservationId });
    if (!reservation) return;

    const settings = await ctx.runQuery(api.settings.get);
    const resend = getResend();
    const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "Shion <onboarding@resend.dev>";
    const detailsHtml = formatReservationHtml(reservation);

    // Email to customer: reservation registered, awaiting confirmation
    await resend.emails.send({
      from: fromEmail,
      to: reservation.email,
      subject: "Shion — Reservation received",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h1 style="font-size:20px;font-weight:300;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:24px">Shion</h1>
          <p style="font-size:15px;line-height:1.6">Dear ${reservation.name},</p>
          <p style="font-size:15px;line-height:1.6">Your reservation request has been received. The restaurant will confirm or decline your reservation shortly.</p>
          ${detailsHtml}
          <p style="font-size:13px;color:#888;margin-top:32px">You will receive another email once the restaurant has reviewed your reservation.</p>
        </div>
      `,
    });

    // Email to admin: new reservation notification
    const adminEmail = settings?.reservationEmail ?? settings?.email;
    if (adminEmail) {
      await resend.emails.send({
        from: fromEmail,
        to: adminEmail,
        subject: `New reservation — ${reservation.name} (${reservation.partySize} guests)`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
            <h1 style="font-size:20px;font-weight:300;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:24px">New Reservation</h1>
            <p style="font-size:15px;line-height:1.6">A new reservation request has been submitted and is awaiting your confirmation.</p>
            ${detailsHtml}
            <a href="${siteUrl}/admin/reservations" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#18181b;color:#fff;text-decoration:none;font-size:14px;letter-spacing:0.1em;text-transform:uppercase">
              View reservations
            </a>
          </div>
        `,
      });
    }
  },
});

export const sendStatusUpdateEmail = action({
  args: {
    reservationId: v.id("reservations"),
    newStatus: v.string(),
  },
  handler: async (ctx, args) => {
    const reservation = await ctx.runQuery(api.reservations.getById, { id: args.reservationId });
    if (!reservation) return;

    const resend = getResend();
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "Shion <onboarding@resend.dev>";
    const detailsHtml = formatReservationHtml(reservation);

    const isConfirmed = args.newStatus === "confirmed";
    const subject = isConfirmed
      ? "Shion — Reservation confirmed"
      : "Shion — Reservation cancelled";

    const message = isConfirmed
      ? "Great news! Your reservation has been confirmed. We look forward to welcoming you."
      : "Unfortunately, your reservation has been cancelled. Please contact us if you have any questions or would like to make a new reservation.";

    await resend.emails.send({
      from: fromEmail,
      to: reservation.email,
      subject,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h1 style="font-size:20px;font-weight:300;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:24px">Shion</h1>
          <p style="font-size:15px;line-height:1.6">Dear ${reservation.name},</p>
          <p style="font-size:15px;line-height:1.6">${message}</p>
          ${detailsHtml}
          <p style="font-size:13px;color:#888;margin-top:32px">Shion — Japanese-French Cuisine</p>
        </div>
      `,
    });
  },
});
