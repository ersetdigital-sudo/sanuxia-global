import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Icon } from "@/components/Icons";
import { BuyWidget } from "@/components/BuyWidget";
import { CopyButton } from "@/components/CopyButton";
import { RotatingWord } from "@/components/RotatingWord";
import { services } from "@/lib/services";
import { rp } from "@/lib/format";

const FAQ = [
  ["Perlu bikin akun dulu?", "Nggak perlu. Langsung pilih layanan, isi data, lalu bayar lewat QRIS."],
  ["Berapa lama pesanan diproses?", "Setelah admin memverifikasi pembayaran, pesanan biasanya selesai di bawah satu menit."],
  ["Metode pembayaran apa aja?", "QRIS, virtual account bank, dan e-wallet populer. Semua ditampilkan saat checkout."],
  ["Kalau nomor tujuan salah?", "Cek ulang sebelum bayar. Transaksi yang sudah diproses tidak bisa dibatalkan."],
  ["Gimana cara lacak pesanan?", "Simpan nomor invoice, lalu buka halaman Lacak dan masukkan nomornya."],
];

const categoryOf = (slug: string) => {
  if (["pulsa", "paket-data", "e-wallet"].includes(slug)) return "Isi ulang";
  if (["pln", "pdam", "tv-internet"].includes(slug)) return "Tagihan";
  return "Hiburan";
};

export default function Home() {
  return (
    <>
      <Header variant="home" />

      <main>
        {/* HERO */}
        <section className="bg-[#EFE8DE] border-b-2 border-[#1664B0]">
          <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-[1.35fr_.65fr]">
            <div className="py-12 md:py-16 lg:pr-12">
              <div className="rise kicker text-[#1664B0] flex items-center gap-2">
                <span className="w-2 h-2 bg-[#D21624]" />
                PPOB / Sanuxia Global / 2026
              </div>
              <h1 className="rise rise-1 mt-5 text-[46px] sm:text-[62px] md:text-[78px] font-extrabold uppercase leading-[.92] text-[#1664B0]">
                Isi ulang.
                <br />
                Bayar.
                <br />
                <span className="text-[#D21624]">
                  <RotatingWord words={["BERES.", "CEPAT.", "AMAN."]} />
                </span>
              </h1>
              <p className="rise rise-2 mt-6 max-w-md text-base md:text-lg leading-relaxed text-[#3E4A52]">
                Pulsa, data, token listrik, game, e-wallet, dan tagihan rumah. Satu tempat, satu standar
                layanan.
              </p>
              <div className="rise rise-3 mt-7 flex flex-wrap gap-2">
                <a href="#beli" className="btn px-5 py-3 text-sm">
                  Mulai transaksi →
                </a>
                <a href="#layanan" className="btn-ghost px-5 py-3 text-sm">
                  Lihat layanan
                </a>
              </div>
              <div className="rise rise-4 mt-10 grid grid-cols-3 border-t border-[#1664B0] pt-4 max-w-lg">
                {[
                  ["Tanpa akun", "Langsung order"],
                  ["QRIS", "Semua e-wallet"],
                  ["Manual", "Diverifikasi admin"],
                ].map(([title, sub]) => (
                  <div key={title} className="border-r border-[#C9C0B2] last:border-r-0 pr-3">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-[#12222E]">{title}</div>
                    <div className="text-[11px] text-[#5F6B73] mt-0.5">{sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1664B0] text-[#EFE8DE] flex flex-col justify-between p-6 md:p-8 -mx-5 lg:mx-0">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[.2em] text-[#EFE8DE]/60">
                  Layanan / 01—09
                </div>
                <div className="disp text-[92px] md:text-[120px] font-extrabold leading-none mt-2 text-[#EFE8DE]">
                  09
                </div>
                <div className="text-sm font-bold uppercase tracking-[.2em]">Layanan aktif</div>
              </div>

              <div className="mt-8 space-y-1.5 text-[11px] font-bold uppercase tracking-[.12em] text-[#EFE8DE]/80">
                {["Pulsa & data", "Token listrik", "Top up game", "Tagihan rumah"].map((item) => (
                  <div key={item} className="flex items-center justify-between border-b border-[#EFE8DE]/20 py-2">
                    {item}
                    <span className="text-[#D21624] bg-[#EFE8DE] w-4 h-4 grid place-items-center text-[9px]">
                      →
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-[#D21624] p-4">
                <div className="text-[10px] font-bold uppercase tracking-[.18em] text-[#EFE8DE]/70">Jam operasional</div>
                <div className="disp text-3xl font-extrabold mt-1">24 / 7</div>
                <div className="text-[11px] mt-1 text-[#EFE8DE]/80">Order kapan pun, admin verifikasi berkala.</div>
              </div>
            </div>
          </div>
        </section>

        {/* DIREKTORI */}
        <section id="layanan" className="max-w-6xl mx-auto px-5 py-12 md:py-16 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b-2 border-[#12222E] pb-5">
            <div>
              <div className="kicker text-[#D21624]">Layanan Digital</div>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold">Beragam kebutuhan, satu platform.</h2>
            </div>
            <p className="text-sm text-[#5F6B73] max-w-xs">
              Pilih dari daftar. Nomor urut menunjukkan urutan layanan yang tersedia.
            </p>
          </div>

          <div className="mt-2">
            {services.map((service, index) => {
              const start = service.items?.[0]?.[2];
              return (
                <Link
                  key={service.slug}
                  href={`/layanan/${service.slug}/`}
                  className="dir-row grid grid-cols-[38px_42px_1fr_auto] md:grid-cols-[56px_48px_1.2fr_1fr_100px_110px_32px] items-center gap-3 md:gap-3.5 py-4 border-b border-[#D7CEC1]"
                >
                  <span className="disp text-lg md:text-xl font-bold text-[#1664B0]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="w-9 h-9 md:w-10 md:h-10 grid place-items-center"
                    style={{ background: service.icon.bg }}
                  >
                    <Icon name={service.icon.name} size={17} stroke={service.icon.stroke} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm md:text-base font-bold leading-tight">{service.title}</span>
                    <span className="block text-[11px] md:hidden text-[#5F6B73] mt-0.5 truncate">
                      {service.blurb}
                    </span>
                  </span>
                  <span className="hidden md:block text-xs text-[#5F6B73]">{service.blurb}</span>
                  <span className="hidden md:block text-[10px] font-bold uppercase tracking-[.14em] text-[#D21624]">
                    {categoryOf(service.slug)}
                  </span>
                  <span className="hidden md:block text-right text-xs font-bold whitespace-nowrap">
                    {start ? `Mulai ${rp(start)}` : "Cek tagihan"}
                  </span>
                  <span className="dir-arrow w-7 h-7 border border-[#D7CEC1] grid place-items-center text-xs transition">
                    →
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ORDER */}
        <section id="beli" className="bg-[#1664B0] text-[#EFE8DE] scroll-mt-24">
          <div className="max-w-6xl mx-auto px-5 py-12 md:py-16 grid lg:grid-cols-[.75fr_1.25fr] gap-8 items-start">
            <div className="min-w-0 lg:sticky lg:top-28">
              <div className="kicker text-[#EFE8DE]/60">Cara order / 02</div>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold leading-[1.05]">Pesan dari sini.</h2>
              <p className="mt-4 text-sm md:text-base text-[#EFE8DE]/70 leading-relaxed max-w-sm">
                Nggak perlu daftar. Tentukan layanan, masukkan data tujuan, lalu bayar dengan QRIS.
              </p>
              <ol className="mt-6 border-t border-[#EFE8DE]/25">
                {[
                  ["01", "Tentukan layanan", "Pilih dari sembilan layanan yang tersedia."],
                  ["02", "Isi data tujuan", "Nomor HP, ID pelanggan, atau User ID game."],
                  ["03", "Bayar via QRIS", "Scan, lalu tekan Saya sudah bayar."],
                ].map(([num, title, desc]) => (
                  <li key={num} className="grid grid-cols-[36px_1fr] gap-3 py-3 border-b border-[#EFE8DE]/20">
                    <span className="disp text-sm font-bold text-[#D21624] bg-[#EFE8DE] h-6 w-7 grid place-items-center">
                      {num}
                    </span>
                    <span>
                      <span className="block text-sm font-bold">{title}</span>
                      <span className="block text-xs text-[#EFE8DE]/60 mt-0.5">{desc}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <p className="text-xs text-[#EFE8DE]/60 mt-4">
                Butuh bantuan?{" "}
                <a
                  href="https://wa.me/6285711172317"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#EFE8DE] underline"
                >
                  WhatsApp admin
                </a>
              </p>
            </div>
            <BuyWidget />
          </div>
        </section>

        {/* PROMO */}
        <section id="promo" className="max-w-6xl mx-auto px-5 py-12 md:py-16 scroll-mt-24">
          <div className="kicker text-[#D21624]">Penawaran / 03</div>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold">Potongan yang jelas.</h2>

          <div className="mt-6 grid md:grid-cols-[1.4fr_.6fr] gap-3">
            <div className="bg-[#D21624] text-[#EFE8DE] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="kicker text-[#EFE8DE]/70">Token listrik</div>
                <div className="disp text-5xl font-extrabold mt-2">10%</div>
                <p className="text-sm text-[#EFE8DE]/80 mt-2 max-w-sm">
                  Cashback untuk pembelian token PLN, maksimal Rp10.000.
                </p>
                <CopyButton code="SANUXIA10" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[.18em] text-[#EFE8DE]/60 md:text-right">
                Kode promo
                <br />
                <span className="text-[#EFE8DE] text-lg font-mono tracking-[.08em]">SANUXIA10</span>
              </div>
            </div>

            <div className="bg-[#EFE8DE] border border-[#D7CEC1] p-6 md:p-8">
              <div className="kicker text-[#1664B0]">Loyalty / 05</div>
              <div className="disp text-5xl font-extrabold text-[#12222E] mt-2">Gratis</div>
              <p className="text-sm text-[#5F6B73] mt-2">
                Biaya admin transaksi kelima setiap bulan, kami yang tanggung.
              </p>
              <div className="mt-5 flex gap-1">
                {[1, 2, 3, 4].map((n) => (
                  <span key={n} className="w-7 h-7 border border-[#1664B0] grid place-items-center text-[10px] font-bold text-[#1664B0]">
                    {n}
                  </span>
                ))}
                <span className="w-7 h-7 bg-[#1664B0] text-[#EFE8DE] grid place-items-center text-[10px] font-bold">05</span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="bg-[#EFE8DE] border-y-2 border-[#1664B0] scroll-mt-24">
          <div className="max-w-6xl mx-auto px-5 py-12 md:py-16 grid lg:grid-cols-[.7fr_1.3fr] gap-8">
            <div>
              <div className="kicker text-[#1664B0]">FAQ / 04</div>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold">Sebelum kamu order.</h2>
              <div className="mt-5 bg-[#D21624] text-[#EFE8DE] p-5">
                <div className="text-[10px] font-bold uppercase tracking-[.16em] text-[#EFE8DE]/70">Admin</div>
                <div className="text-lg font-bold mt-1">0857 1117 2317</div>
                <a
                  href="https://wa.me/6285711172317"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-3 text-xs font-bold uppercase tracking-wider underline"
                >
                  Chat WhatsApp →
                </a>
              </div>
            </div>

            <div>
              {FAQ.map(([q, a], i) => (
                <details key={q} className="border-t border-[#C9C0B2] py-4">
                  <summary className="flex items-start justify-between gap-4 cursor-pointer">
                    <span className="flex gap-3">
                      <span className="disp text-xs font-bold text-[#D21624] pt-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm md:text-base font-bold">{q}</span>
                    </span>
                    <span className="pl transition text-xl leading-none text-[#1664B0]">+</span>
                  </summary>
                  <p className="text-sm text-[#5F6B73] mt-2 pl-8 leading-relaxed">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
