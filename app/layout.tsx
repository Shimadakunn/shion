import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import localFont from "next/font/local";
import { getLocale } from "next-intl/server";
import "./globals.css";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });
const seriffic = localFont({
  src: "../lib/modern.otf",
  variable: "--font-serif",
});
export const metadata: Metadata = {
  title: "Shion — Cuisine Franco-Japonaise",
  description:
    "Restaurant gastronomique franco-japonais. Réservez votre table pour une expérience culinaire unique.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`dark ${figtree.variable} ${seriffic.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
