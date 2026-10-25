import Link from "next/link";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrackClient } from "@/components/TrackClient";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata = {
  title: "Lacak Pesanan · Sanuxia Global",
};

export default function TrackPage() {
  return (
    <>
      <Header />

      <main className="max-w-3xl mx-auto px-5 py-4 min-h-[70vh]">
        <Breadcrumbs
          items={[
            { label: "Beranda", href: "/" },
            { label: "Lacak Pesanan", href: "/cek-pesanan/" },
          ]}
        />
        <div className="kicker text-[#D21624]">Manifest</div>
        <h1 className="text-2xl md:text-3xl font-extrabold mt-1.5">Lacak pesanan.</h1>
        <p className="text-sm text-[#5F6B73] mt-2">Masukkan nomor invoice untuk melihat status dan rincian.</p>

        <Suspense fallback={<div className="h-32" />}>
          <TrackClient />
        </Suspense>

        <div className="mt-6 text-center text-xs">
          <Link href="/" className="font-bold text-[#1664B0] hover:underline">
            ← Kembali ke beranda
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}
