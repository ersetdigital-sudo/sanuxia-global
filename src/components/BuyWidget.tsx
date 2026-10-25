"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GAMES, gameNames } from "@/lib/games";
import { operator, rp } from "@/lib/format";
import { saveOrder } from "@/lib/store";
import type { OrderLine } from "@/lib/store";
import { TAB_EVENT } from "./TabLink";
import { OperatorLogo } from "./OperatorLogo";

type TabKey = "pulsa" | "data" | "pln" | "game" | "ewallet" | "tagihan";

const TABS: { key: TabKey; label: string }[] = [
  { key: "pulsa", label: "Pulsa" },
  { key: "data", label: "Data" },
  { key: "pln", label: "PLN" },
  { key: "game", label: "Game" },
  { key: "ewallet", label: "E-Wallet" },
  { key: "tagihan", label: "Tagihan" },
];

type Product = { l: string; ph: string; n: [string, number][] };

const P: Record<TabKey, Product> = {
  pulsa: {
    l: "Nomor HP",
    ph: "08xx xxxx xxxx",
    n: [["5rb", 6500], ["10rb", 11000], ["20rb", 20800], ["25rb", 25800], ["50rb", 50300], ["100rb", 99500]],
  },
  data: {
    l: "Nomor HP",
    ph: "08xx xxxx xxxx",
    n: [["2GB", 12000], ["5GB", 25000], ["10GB", 45000], ["15GB", 60000], ["25GB", 85000], ["50GB", 130000]],
  },
  pln: {
    l: "Nomor meter / ID pelanggan",
    ph: "Contoh: 5123 4567 8901",
    n: [["20rb", 20800], ["50rb", 50300], ["100rb", 100300], ["200rb", 200300], ["500rb", 500300], ["1jt", 1000300]],
  },
  ewallet: {
    l: "Nomor e-wallet",
    ph: "08xx xxxx xxxx",
    n: [["10rb", 11000], ["25rb", 26000], ["50rb", 51000], ["100rb", 101000], ["200rb", 201000], ["500rb", 501000]],
  },
  game: { l: "User ID", ph: "Masukkan User ID", n: [] },
  tagihan: {
    l: "ID pelanggan",
    ph: "BPJS / PDAM / internet",
    n: [["BPJS", 2500], ["PDAM", 2500], ["TV & Internet", 2500], ["Multifinance", 3500]],
  },
};

const SERVICE_NAME: Record<TabKey, string> = {
  pulsa: "Pulsa",
  data: "Paket Data",
  pln: "Token PLN",
  game: "",
  ewallet: "E-Wallet",
  tagihan: "Tagihan",
};

const SERVICE_SLUG: Record<TabKey, string> = {
  pulsa: "pulsa",
  data: "paket-data",
  pln: "pln",
  game: "top-up-game",
  ewallet: "e-wallet",
  tagihan: "pdam",
};

const digits = (v: string) => v.replace(/\D/g, "");

export function BuyWidget() {
  const router = useRouter();

  const [tab, setTab] = useState<TabKey>("pulsa");
  const [game, setGame] = useState(gameNames[0]);
  const [sel, setSel] = useState<number | null>(null);
  const [num, setNum] = useState("");
  const [zone, setZone] = useState("");

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("tab");
    if (fromUrl && fromUrl in P) setTab(fromUrl as TabKey);
    const onTab = (e: Event) => {
      const next = (e as CustomEvent<string>).detail;
      if (next && next in P) setTab(next as TabKey);
    };
    window.addEventListener(TAB_EVENT, onTab);
    return () => window.removeEventListener(TAB_EVENT, onTab);
  }, []);

  useEffect(() => {
    setSel(null);
  }, [tab, game]);

  const products: [string, number][] = tab === "game" ? GAMES[game].chips.map(([a, , p]) => [a, p]) : P[tab].n;
  const op = tab === "pulsa" || tab === "data" || tab === "ewallet" ? operator(num) : "";
  const selected = sel !== null ? products[sel] : null;
  const price = selected ? selected[1] : 0;
  const zoneVisible = tab === "game" && GAMES[game].zone;
  const canPay = price > 0 && digits(num).length >= (tab === "game" ? 5 : 8);

  const selectTab = useCallback((key: TabKey) => {
    setTab(key);
    window.history.replaceState(null, "", `/?tab=${key}`);
  }, []);

  const handlePay = () => {
    if (!canPay || !selected) return;
    const service = tab === "game" ? game : SERVICE_NAME[tab];
    const lines: OrderLine[] = [
      ["Layanan", service],
      [P[tab].l, num + (op ? ` · ${op}` : "")],
      ["Produk", selected[0]],
    ];
    if (zoneVisible && zone) lines.push(["Zone ID", zone]);

    saveOrder({
      ok: true,
      slug: SERVICE_SLUG[tab],
      service,
      product: selected[0],
      price,
      admin: 0,
      lines,
      type: tab === "game" ? "game" : "prepaid",
    });
    router.push("/checkout/");
  };

  return (
    <div
      data-buy-form
      className="w-full min-w-0 bg-white text-[#12222E] border border-[#D7CEC1] shadow-[0_28px_70px_-45px_rgba(0,0,0,.75)]"
    >
      <div className="px-5 py-4 border-b-2 border-[#12222E] flex items-start justify-between gap-4">
        <div>
          <div className="kicker text-[#D21624]">Order desk / 02</div>
          <h2 className="disp text-2xl font-extrabold mt-1">Buat transaksi</h2>
          <p className="text-xs text-[#5F6B73] mt-1">Harga final, tanpa biaya tersembunyi.</p>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1.5 border border-[#1664B0] px-2 py-1 text-[9px] font-bold uppercase tracking-[.14em] text-[#1664B0]">
          <span className="w-1.5 h-1.5 bg-[#D21624]" />
          Instan
        </span>
      </div>

      <div className="flex overflow-x-auto border-b border-[#D7CEC1] [scrollbar-width:none]">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            aria-pressed={tab === t.key}
            onClick={() => selectTab(t.key)}
            className={`shrink-0 px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-[.1em] transition sm:flex-1 ${
              tab === t.key
                ? "bg-[#1664B0] text-white"
                : "bg-[#FCFAF6] text-[#5F6B73] hover:bg-[#EFE8DE] hover:text-[#12222E]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {tab === "game" && (
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div className="kicker text-[#5F6B73]">Pilih game</div>
              <span className="text-[10px] font-semibold text-[#9A9083]">{gameNames.length} game</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {gameNames.map((name) => {
                const active = name === game;
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setGame(name)}
                    className={`relative flex items-center gap-2 border px-2 py-2 text-left transition ${
                      active
                        ? "border-[#1664B0] bg-[#EFE8DE] shadow-[inset_0_0_0_1px_#1664B0]"
                        : "border-[#D7CEC1] bg-white hover:border-[#1664B0]"
                    }`}
                  >
                    <span
                      className={`disp w-7 h-7 shrink-0 grid place-items-center text-[8px] font-extrabold ${
                        active ? "bg-[#1664B0] text-[#EFE8DE]" : "bg-[#12222E] text-[#EFE8DE]"
                      }`}
                    >
                      {GAMES[name].mark}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-bold leading-tight truncate">{name}</span>
                      <span className="block text-[9px] uppercase tracking-wider text-[#5F6B73] mt-0.5">
                        {GAMES[name].tag}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <label className="block text-[10px] font-bold uppercase tracking-[.14em] text-[#5F6B73]" htmlFor="buy-num">
          {P[tab].l}
        </label>
        <div className="relative mt-1.5">
          <input
            id="buy-num"
            value={num}
            onChange={(e) => setNum(e.target.value)}
            inputMode="numeric"
            placeholder={P[tab].ph}
            className="inp text-base"
          />
          {op && (
            <span
              data-operator-badge
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 border border-[#C9C0B2] bg-white px-2 py-1"
            >
              <OperatorLogo name={op} size={15} />
              <span className="text-[10px] font-bold">{op}</span>
            </span>
          )}
        </div>

        <input
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          placeholder="Zone ID"
          aria-label="Zone ID"
          className={`${zoneVisible ? "" : "hidden"} inp mt-2`}
        />

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="kicker text-[#5F6B73]">Pilih nominal</div>
          <span className="text-[10px] font-semibold text-[#9A9083]">Harga final</span>
        </div>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {products.map(([label, value], i) => (
            <button
              key={label}
              type="button"
              aria-pressed={sel === i}
              onClick={() => setSel(i)}
              className={`relative border px-3 py-2.5 text-left min-h-[68px] transition ${
                sel === i
                  ? "border-[#1664B0] bg-[#EFE8DE] shadow-[inset_0_0_0_1px_#1664B0]"
                  : "border-[#D7CEC1] bg-white hover:border-[#1664B0]"
              }`}
            >
              {sel === i && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-[#1664B0] grid place-items-center">
                  <span className="text-[8px] text-white">✓</span>
                </span>
              )}
              <div className="disp text-base font-extrabold">{label}</div>
              <div className="text-[11px] font-bold text-[#D21624] mt-1">
                {tab === "tagihan" ? `admin ${rp(value)}` : rp(value)}
              </div>
            </button>
          ))}
        </div>

        <div className="-mx-5 -mb-5 mt-5 border-t-2 border-[#1664B0] bg-[#EFE8DE] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-[.16em] text-[#5F6B73]">Total bayar</div>
              <div className="disp text-2xl font-extrabold text-[#1664B0] mt-0.5">{rp(price)}</div>
            </div>
            <button
              type="button"
              onClick={handlePay}
              disabled={!canPay}
              className="btn px-5 py-3 text-xs uppercase tracking-[.1em]"
            >
              Bayar →
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-bold uppercase tracking-[.1em] text-[#5F6B73]">
            <span>Tanpa akun</span>
            <span>QRIS</span>
            <span>Verifikasi admin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
