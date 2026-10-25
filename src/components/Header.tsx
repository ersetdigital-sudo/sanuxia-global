import Link from "next/link";
import { Logo } from "./Logo";
import { TabLink } from "./TabLink";

type Variant = "home" | "sub";

const NAV: Record<Variant, { href: string; label: string; tab?: string }[]> = {
  home: [
    { href: "/", label: "Beranda" },
    { href: "#layanan", label: "Layanan" },
    { href: "#beli", label: "Transaksi" },
    { href: "/?tab=game#beli", label: "Game", tab: "game" },
    { href: "#promo", label: "Promo" },
    { href: "#faq", label: "FAQ" },
    { href: "/cek-pesanan/", label: "Lacak" },
  ],
  sub: [
    { href: "/", label: "Beranda" },
    { href: "/#layanan", label: "Layanan" },
    { href: "/layanan/pulsa/", label: "Pulsa" },
    { href: "/layanan/top-up-game/", label: "Game" },
    { href: "/#promo", label: "Promo" },
    { href: "/#faq", label: "FAQ" },
    { href: "/cek-pesanan/", label: "Lacak" },
  ],
};

export function Header({ variant = "sub" }: { variant?: Variant }) {
  const nav = NAV[variant];

  return (
    <>
      <div className="bg-[#D21624] text-[#EFE8DE]">
        <div className="max-w-6xl mx-auto px-5 h-9 flex items-center justify-between gap-4 text-[10px] font-bold tracking-[.16em] uppercase">
          <span>Sanuxia Global / PPOB</span>
          <span className="hidden sm:block">Satu standar layanan</span>
          <a href="https://wa.me/6285711172317" target="_blank" rel="noreferrer" className="hover:underline">
            WA 0857 1117 2317
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-[#FCFAF6]/97 backdrop-blur border-b-2 border-[#1664B0]">
        <div className="max-w-6xl mx-auto px-5 h-[68px] flex items-center justify-between">
          {variant === "home" ? (
            <a href="#" aria-label="Sanuxia Global">
              <Logo />
            </a>
          ) : (
            <Link href="/" aria-label="Sanuxia Global">
              <Logo />
            </Link>
          )}

          <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-[11px] font-bold uppercase tracking-[.12em] text-[#5F6B73]">
            {nav.map((item) =>
              item.tab ? (
                <TabLink key={item.label} tab={item.tab} href={item.href} className="hover:text-[#12222E]">
                  {item.label}
                </TabLink>
              ) : item.href.startsWith("#") ? (
                <a key={item.label} href={item.href} className="hover:text-[#12222E]">
                  {item.label}
                </a>
              ) : (
                <Link key={item.label} href={item.href} className="hover:text-[#12222E]">
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <Link
            href={variant === "home" ? "#beli" : "/#layanan"}
            className="btn px-4 py-2.5 text-xs uppercase tracking-[.08em]"
          >
            {variant === "home" ? "Mulai order" : "Semua layanan"}
          </Link>
        </div>
      </header>
    </>
  );
}
