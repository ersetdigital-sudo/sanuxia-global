import type { Metadata } from "next";
import { Bricolage_Grotesque, Public_Sans } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sanuxia Global · Isi Ulang & Bayar Tagihan",
  description:
    "Pulsa, paket data, token PLN, top up game, e-wallet, dan bayar tagihan. Satu standar layanan, buka 24 jam.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${bricolage.variable} ${publicSans.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
