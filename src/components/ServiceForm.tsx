"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GAMES, gameNames } from "@/lib/games";
import { hash, operator, rp } from "@/lib/format";
import { ADMIN_WHATSAPP, ADMIN_WHATSAPP_DISPLAY, saveOrder } from "@/lib/store";
import type { OrderLine } from "@/lib/store";
import type { Field, Service } from "@/lib/services";
import { Icon } from "./Icons";
import { OperatorLogo } from "./OperatorLogo";
import { operatorNames } from "@/lib/operators";

type Bill = { name: string; amt: number; period: string };

export function ServiceForm({ service, others }: { service: Service; others: Service[] }) {
  const router = useRouter();
  const fieldsRef = useRef<HTMLDivElement>(null);

  const [game, setGame] = useState(gameNames[0]);
  const [vals, setVals] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of service.fields) if (f.sel) init[f.id] = f.sel[0];
    return init;
  });
  const [item, setItem] = useState<number | null>(null);
  const [bill, setBill] = useState<Bill | null>(null);
  const [billError, setBillError] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width:1023px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    document.body.style.paddingBottom = isMobile ? "calc(88px + env(safe-area-inset-bottom))" : "";
    return () => {
      document.body.style.paddingBottom = "";
    };
  }, [isMobile]);

  const fields = useMemo<Field[]>(() => {
    if (service.type !== "game") return service.fields;
    const g = GAMES[game];
    const list: Field[] = [{ id: "target", label: "User ID", ph: "Masukkan User ID", num: true }];
    if (g.zone) {
      list.push({
        id: "zone",
        label: g.label || "Zone ID",
        ph: g.label ? "Contoh: Asia" : "Contoh: 2241",
        num: !g.label,
      });
    }
    return list;
  }, [service, game]);

  const items = service.type === "game" ? GAMES[game].items : (service.items ?? []);
  const targetField = fields.find((f) => f.id === "target");
  const opTag = targetField?.op ? operator(vals.target ?? "") : "";
  const digits = (v: string) => v.replace(/\D/g, "");
  const target = digits(vals.target ?? "");
  const okT = target.length >= (service.type === "game" ? 5 : 8);
  const okZ = !(service.type === "game" && GAMES[game].zone) || (vals.zone ?? "").trim().length > 0;

  const order = useMemo(() => {
    const lines: OrderLine[] = [["Layanan", service.type === "game" ? game : service.name]];
    const prov = fields.find((f) => f.sel);
    if (prov && vals.provider) lines.push([prov.label, vals.provider]);
    if (target && targetField) {
      lines.push([targetField.label, `${vals.target}${opTag ? ` · ${opTag}` : ""}`]);
    }
    if (vals.zone) lines.push([GAMES[game].label || "Zone ID", vals.zone]);

    let price = 0;
    let product = "";
    let admin = 0;

    if (service.type === "bill") {
      if (bill) {
        lines.push(["Nama", bill.name], ["Periode", bill.period]);
        price = bill.amt;
        admin = service.admin ?? 0;
        product = `Tagihan ${service.name}`;
      }
    } else if (item !== null && items[item]) {
      const it = items[item];
      product = it[0];
      price = it[2];
      lines.push(["Produk", it[1] ? `${it[0]} (${it[1]})` : it[0]]);
    }

    return {
      ok: okT && okZ && (service.type === "bill" ? !!bill : item !== null),
      slug: service.slug,
      service: service.name,
      product,
      price,
      admin,
      lines,
      type: service.type,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service, fields, items, game, vals, item, bill, target, targetField, opTag, okT, okZ]);

  const setField = (id: string, value: string) => {
    setVals((v) => ({ ...v, [id]: value }));
    if (service.type === "bill") {
      setBill(null);
      setBillError("");
    }
  };

  const changeGame = (name: string) => {
    setGame(name);
    setVals({});
    setItem(null);
  };

  const checkBill = () => {
    const id = digits(vals.target ?? "");
    if (id.length < 6) {
      setBill(null);
      setBillError("ID minimal 6 digit.");
      return;
    }
    const h = hash(id + service.slug);
    let amt = 50000 + (h % 300) * 1000;
    if (service.slug === "bpjs-kesehatan") {
      const months = parseInt(vals.provider) || 1;
      amt = 35000 * months * (1 + (h % 4));
    }
    const name = `Pelanggan ${String.fromCharCode(65 + (h % 26))}*** ${String.fromCharCode(65 + ((h >> 3) % 26))}***`;
    const period = new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    setBill({ name, amt, period });
    setBillError("");
  };

  const goCheckout = () => {
    if (!order.ok) return;
    saveOrder(order);
    router.push("/checkout/");
  };

  const total = order.price + order.admin;

  const renderField = (f: Field) => {
    if (f.sel) {
      return (
        <label key={f.id} className="block">
          <span className="text-[10px] font-bold uppercase tracking-[.14em] text-[#5F6B73]">{f.label}</span>
          <select
            data-f={f.id}
            value={vals[f.id] ?? f.sel[0]}
            onChange={(e) => setField(f.id, e.target.value)}
            className="inp mt-1.5"
          >
            {f.sel.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
      );
    }
    return (
      <label key={f.id} className="block">
        <span className="text-[10px] font-bold uppercase tracking-[.14em] text-[#5F6B73]">{f.label}</span>
        <span className="relative block mt-1.5">
          <input
            data-f={f.id}
            inputMode={f.num ? "numeric" : undefined}
            placeholder={f.ph ?? ""}
            value={vals[f.id] ?? ""}
            onChange={(e) => setField(f.id, e.target.value)}
            className="inp"
          />
          {f.op && (
            <span
              data-operator-badge
              className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 border border-[#C9C0B2] bg-white px-2 py-1 ${
                opTag ? "" : "hidden"
              }`}
            >
              <OperatorLogo name={opTag} size={16} />
              <span className="text-[10px] font-bold">{opTag}</span>
            </span>
          )}
        </span>
      </label>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        {/* 01 DATA */}
        <section className="p-5 md:p-7">
          <div className="flex items-center justify-between gap-4 border-b border-[#D7CEC1] pb-3">
            <div className="flex items-center gap-3">
              <span className="disp w-7 h-7 bg-[#1664B0] text-[#EFE8DE] grid place-items-center text-xs font-bold">
                01
              </span>
              <h2 className="text-lg font-bold">
                {service.type === "bill"
                  ? "Data tagihan"
                  : service.type === "game"
                    ? "Game & data tujuan"
                    : "Data tujuan"}
              </h2>
            </div>
            <span className="hidden sm:block text-[10px] font-bold uppercase tracking-[.14em] text-[#5F6B73]">
              {service.type === "bill"
                ? "Cek tagihan"
                : service.type === "game"
                  ? `${gameNames.length} game`
                  : "Operator otomatis"}
            </span>
          </div>

          {service.type === "game" && (
            <div className="mt-4">
              <div className="kicker text-[#5F6B73]">Pilih game</div>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-1.5">
                {gameNames.map((name) => {
                  const active = name === game;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => changeGame(name)}
                      className={`flex items-center gap-2 border px-2.5 py-2 text-left transition ${
                        active
                          ? "border-[#D21624] bg-[#EFE8DE]"
                          : "border-[#D7CEC1] bg-white hover:border-[#1664B0]"
                      }`}
                    >
                      <span
                        className={`disp w-8 h-8 shrink-0 grid place-items-center text-[9px] font-extrabold ${
                          active ? "bg-[#D21624] text-[#EFE8DE]" : "bg-[#1664B0] text-[#EFE8DE]"
                        }`}
                      >
                        {GAMES[name].mark}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-bold leading-tight truncate">{name}</span>
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

          {["pulsa", "paket-data"].includes(service.slug) && (
            <div data-operator-list className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[9px] font-bold uppercase tracking-[.14em] text-[#5F6B73] mr-1">
                Operator
              </span>
              {operatorNames.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1 border border-[#D7CEC1] bg-white px-1.5 py-1"
                >
                  <OperatorLogo name={name} size={14} />
                  <span className="text-[9px] font-bold text-[#5F6B73]">{name}</span>
                </span>
              ))}
            </div>
          )}

          <div
            ref={fieldsRef}
            className={`${
              service.type === "game"
                ? "mt-4 pt-4 border-t border-dashed border-[#D7CEC1]"
                : "mt-4"
            } grid sm:grid-cols-2 gap-3`}
          >
            {fields.map(renderField)}
          </div>

          {service.type === "bill" && (
            <div className="mt-4">
              <button type="button" onClick={checkBill} className="btn-blue w-full sm:w-auto">
                Cek tagihan
              </button>
              {billError && <p className="text-sm text-[#C81E3C] mt-3">{billError}</p>}
              {bill && (
                <div className="mt-4 border border-[#D7CEC1] p-4 text-sm">
                  <div className="kicker text-[#1664B0]">Tagihan ditemukan</div>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between gap-3">
                      <span className="text-[#5F6B73]">Nama</span>
                      <b className="text-right">{bill.name}</b>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-[#5F6B73]">Periode</span>
                      <b className="text-right">{bill.period}</b>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-[#5F6B73]">Tagihan</span>
                      <b>{rp(bill.amt)}</b>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-[#5F6B73]">Biaya admin</span>
                      <b>{rp(service.admin ?? 0)}</b>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 02 PRODUK */}
        {service.type !== "bill" && (
          <section className="p-5 md:p-7 border-t-2 border-[#1664B0]">
            <div className="flex items-center justify-between gap-4 border-b border-[#D7CEC1] pb-3">
              <div className="flex items-center gap-3">
                <span className="disp w-7 h-7 bg-[#1664B0] text-[#EFE8DE] grid place-items-center text-xs font-bold">
                  02
                </span>
                <h2 className="text-lg font-bold">
                  {service.type === "game" ? "Pilih item" : "Pilih nominal"}
                </h2>
              </div>
              <span className="hidden sm:block text-[10px] font-bold uppercase tracking-[.14em] text-[#5F6B73]">
                {items.length} pilihan
              </span>
            </div>

            {service.type === "game" && (
              <div className="mt-3 flex justify-between text-[10px] font-bold uppercase tracking-[.14em] text-[#5F6B73]">
                <span>Item untuk</span>
                <span className="text-[#D21624]">{game}</span>
              </div>
            )}

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {items.map((it, i) => (
                <button
                  key={it[0]}
                  type="button"
                  onClick={() => setItem(i)}
                  className={`border px-3 py-2.5 text-left min-h-[68px] transition ${
                    item === i
                      ? "border-[#1664B0] bg-[#EFE8DE] shadow-[inset_0_0_0_1px_#1664B0]"
                      : "border-[#D7CEC1] bg-white hover:border-[#1664B0]"
                  }`}
                >
                  <div className="disp text-sm font-bold">{it[0]}</div>
                  {it[1] ? <div className="text-[10px] text-[#5F6B73] mt-0.5">{it[1]}</div> : null}
                  <div className="text-xs font-bold text-[#D21624] mt-1.5">{rp(it[2])}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* RINGKASAN */}
        <section className="p-5 md:p-7 border-t-2 border-[#1664B0] bg-[#FCFAF6]">
          <div className="flex items-center gap-3 border-b border-[#D7CEC1] pb-3">
            <span className="disp w-7 h-7 bg-[#D21624] text-[#EFE8DE] grid place-items-center text-xs font-bold">
              {service.type === "bill" ? "02" : "03"}
            </span>
            <h2 className="text-lg font-bold">Ringkasan</h2>
          </div>
          <div className="mt-4 space-y-2.5 text-sm">
            {order.lines.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <span className="text-[#5F6B73] shrink-0">{k}</span>
                <b className="text-right break-words">{v}</b>
              </div>
            ))}
            {order.admin > 0 && (
              <div className="flex justify-between">
                <span className="text-[#5F6B73]">Biaya admin</span>
                <b>{rp(order.admin)}</b>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-dashed border-[#C9C0B2] flex justify-between items-baseline">
            <span className="text-[10px] font-bold uppercase tracking-[.16em] text-[#5F6B73]">Total</span>
            <span className="disp text-2xl font-extrabold">{rp(total)}</span>
          </div>
          <button type="button" onClick={goCheckout} disabled={!order.ok} className="btn w-full mt-4 hidden lg:block">
            Lanjut ke pembayaran →
          </button>
          <p className="hidden lg:block text-[11px] text-[#5F6B73] mt-2 text-center">
            Pembayaran diverifikasi manual oleh admin.
          </p>
        </section>
      </div>

      {/* info */}
      <div className="mt-4 grid md:grid-cols-2 gap-3">
        <div className="card p-5">
          <div className="kicker text-[#D21624]">Cara bayar</div>
          <ol className="mt-3 space-y-3 text-sm">
            {service.how.map((text, i) => (
              <li key={text} className="flex gap-3">
                <span className="disp w-5 h-5 shrink-0 bg-[#1664B0] text-[#EFE8DE] grid place-items-center text-[10px] font-bold">
                  {i + 1}
                </span>
                <span className="text-[#3E4A52]">{text}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="card p-5">
          <div className="kicker text-[#D21624]">Pertanyaan umum</div>
          <div className="mt-2">
            {service.faq.map(([q, a]) => (
              <details key={q} className="border-t border-[#D7CEC1] py-3">
                <summary className="flex justify-between gap-3 cursor-pointer text-sm font-bold">
                  {q}
                  <span className="pl transition text-lg leading-none text-[#1664B0]">+</span>
                </summary>
                <p className="text-[#5F6B73] mt-2 text-sm">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 border border-[#D7CEC1] bg-[#EFE8DE] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs text-[#3E4A52]">
          Butuh bantuan? Admin siap membantu lewat WhatsApp.
        </span>
        <a
          href={ADMIN_WHATSAPP}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-bold text-[#D21624] underline"
        >
          {ADMIN_WHATSAPP_DISPLAY}
        </a>
      </div>

      <div className="mt-6">
        <div className="kicker text-[#5F6B73] border-b-2 border-[#12222E] pb-2">Layanan lain</div>
        <div className="grid sm:grid-cols-2">
          {others.map((other, i) => (
            <Link
              key={other.slug}
              href={`/layanan/${other.slug}/`}
              className="flex items-center gap-3 border-b border-[#D7CEC1] py-2.5 sm:odd:pr-4 sm:even:pl-4 hover:bg-[#EFE8DE]"
            >
              <span className="disp text-[10px] font-bold text-[#D21624]">{String(i + 2).padStart(2, "0")}</span>
              <span className="text-xs font-bold">{other.title}</span>
              <span className="ml-auto text-[#5F6B73]">→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* mobile sticky */}
      {isMobile && (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-[#FCFAF6] border-t-2 border-[#1664B0] px-3 pt-2.5 pb-[calc(.6rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-2">
            <div className="min-w-0 shrink-0 pl-1 pr-2">
              <div className="text-[9px] font-bold uppercase tracking-[.14em] text-[#5F6B73]">Total</div>
              <div className="disp text-base font-bold">{rp(total)}</div>
            </div>
            <button
              type="button"
              onClick={goCheckout}
              disabled={!order.ok}
              className="btn flex-1 min-h-[44px] text-xs uppercase tracking-wider"
            >
              Lanjut ke pembayaran →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
