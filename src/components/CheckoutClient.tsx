"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "./Icons";
import { rp } from "@/lib/format";
import {
  ADMIN_WHATSAPP,
  ADMIN_WHATSAPP_DISPLAY,
  QRIS_IMAGE,
  clearOrder,
  loadOrder,
  loadOrders,
  saveOrders,
} from "@/lib/store";
import type { Order, SavedOrder } from "@/lib/store";

type Method = { id: "qris"; n: string; fee: number; pct: number; group: string };

const METHOD: Method = { id: "qris", n: "QRIS", fee: 0, pct: 0.007, group: "QRIS" };

export function CheckoutClient() {
  const [order, setOrder] = useState<Order | null>(null);
  const [ready, setReady] = useState(false);
  const [inv, setInv] = useState("");
  const method = METHOD;
  const [left, setLeft] = useState(900);
  const [timedOut, setTimedOut] = useState(false);
  const [paid, setPaid] = useState(false);

  const leftRef = useRef(900);

  useEffect(() => {
    setOrder(loadOrder());
    setInv("SNX" + Date.now().toString().slice(-9));
    setReady(true);
  }, []);

  const fee = useMemo(() => {
    if (!order) return 0;
    return Math.round(method.fee + method.pct * (order.price + order.admin));
  }, [order, method]);

  const total = order ? order.price + order.admin + fee : 0;

  const saveOrd = useCallback(
    (status: "pending" | "processing") => {
      if (!order) return;
      const all = loadOrders();
      const i = all.findIndex((x) => x.inv === inv);
      const prev = i >= 0 ? all[i] : undefined;
      const record: SavedOrder = {
        inv,
        status,
        service: order.service,
        product: order.product,
        lines: order.lines,
        method: method.n,
        total: order.price + order.admin + fee,
        contact: "",
        sn: prev?.sn || "",
        label: prev?.label || "",
        created: prev?.created ?? Date.now(),
        updated: Date.now(),
      };
      if (status === "processing") record.paidAt = Date.now();
      if (i >= 0) all[i] = record;
      else all.unshift(record);
      saveOrders(all);
    },
    [order, inv, method, fee],
  );

  useEffect(() => {
    if (!ready || !order) return;
    saveOrd("pending");
  }, [ready, order, saveOrd]);

  useEffect(() => {
    if (!ready || !order || paid) return;
    const t = setInterval(() => {
      leftRef.current -= 1;
      setLeft(leftRef.current);
      if (leftRef.current <= 0) {
        clearInterval(t);
        setTimedOut(true);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [ready, order, paid]);

  const markPaid = () => {
    if (!order) return;
    saveOrd("processing");
    clearOrder();
    setPaid(true);
  };

  const summaryRows = useMemo(() => {
    if (!order) return [];
    const rows: [string, string][] = order.lines.map(([k, v]) => [k, v]);
    rows.push(["Harga", rp(order.price)]);
    if (order.admin) rows.push(["Biaya admin", rp(order.admin)]);
    rows.push(["Biaya layanan (QRIS)", fee ? rp(fee) : "Gratis"]);
    return rows;
  }, [order, fee]);

  if (!ready) return <div className="h-40" />;

  if (!order) {
    return (
      <div className="card p-10 text-center">
        <h2 className="text-xl font-bold">Belum ada pesanan</h2>
        <p className="text-sm text-[#5F6B73] mt-2">Pilih layanan dulu dari halaman utama.</p>
        <Link href="/#layanan" className="btn inline-block mt-5">
          Lihat layanan
        </Link>
      </div>
    );
  }

  if (paid) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="card overflow-hidden">
          <div className="bg-[#D21624] text-[#EFE8DE] p-6">
            <div className="kicker text-[#EFE8DE]/70">Pembayaran diterima</div>
            <h2 className="text-2xl font-extrabold mt-2 leading-tight">
              Terima kasih, pembayaran Anda sedang diproses
            </h2>
            <p className="text-sm text-[#EFE8DE]/80 mt-2">
              Admin akan memverifikasi pembayaran dan memproses pesananmu.
            </p>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between gap-4 border-b border-[#D7CEC1] pb-4">
              <div>
                <div className="kicker text-[#5F6B73]">Invoice</div>
                <div className="font-mono text-lg font-bold mt-1">{inv}</div>
              </div>
              <span className="stamp px-3 py-1 text-[10px]">Diproses</span>
            </div>

            <div className="mt-4 space-y-2.5 text-sm">
              {order.lines.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-[#5F6B73]">{k}</span>
                  <b className="text-right">{v}</b>
                </div>
              ))}
              <div className="flex justify-between gap-4">
                <span className="text-[#5F6B73]">Metode</span>
                <b>{method.n}</b>
              </div>
              <div className="flex justify-between gap-4 pt-2 border-t border-[#D7CEC1]">
                <span className="text-[#5F6B73]">Total pembayaran</span>
                <b className="text-lg">{rp(total)}</b>
              </div>
            </div>

            <Link href={`/cek-pesanan/?inv=${inv}`} className="btn w-full mt-5 inline-flex justify-center">
              Lacak pesanan
            </Link>
            <a
              href={ADMIN_WHATSAPP}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost w-full mt-2 inline-flex justify-center"
            >
              Hubungi admin
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1.25fr_.75fr] gap-5 items-start">
      <div className="card overflow-hidden">
        <div className="bg-[#1664B0] text-[#EFE8DE] px-5 md:px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="kicker text-[#EFE8DE]/60">Invoice / Sanuxia Global</div>
              <div className="font-mono text-xl font-bold mt-1">{inv}</div>
            </div>
            <div className="sm:text-right">
              <div className="text-[10px] font-bold uppercase tracking-[.16em] text-[#EFE8DE]/60">
                Selesaikan dalam
              </div>
              <div className="disp text-2xl font-extrabold mt-0.5">
                {timedOut
                  ? "Waktu habis"
                  : `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 md:p-6">
          <div className="kicker text-[#D21624]">01 / Metode pembayaran</div>
          <div className="mt-2 flex items-center justify-between gap-3 border border-[#1664B0] bg-[#EFE8DE] px-3 py-2.5">
            <div>
              <div className="text-sm font-bold">QRIS</div>
              <div className="text-[10px] text-[#5F6B73]">Semua e-wallet & m-banking</div>
            </div>
            <div className="text-[10px] font-bold text-[#1664B0]">+0,7%</div>
          </div>

          <div className="kicker text-[#D21624] mt-5">02 / Bayar</div>

          <div className="mt-2 border border-[#D7CEC1] bg-[#EFE8DE] p-3 md:p-4">
            <div className="mx-auto max-w-[320px] bg-white border border-[#D7CEC1] p-2.5">
              <img
                src={QRIS_IMAGE}
                alt="Kode QRIS Sanuxia Global"
                width={640}
                height={640}
                loading="eager"
                className="block w-full h-auto"
              />
            </div>
            <div className="mt-3 flex items-end justify-between gap-3 max-w-[320px] mx-auto">
              <div>
                <div className="kicker text-[#5F6B73]">Total bayar</div>
                <div className="disp text-xl font-extrabold mt-0.5">{rp(total)}</div>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#1664B0]">QRIS</div>
            </div>
          </div>

          <button type="button" onClick={markPaid} disabled={timedOut} className="btn w-full mt-4">
            Saya sudah bayar
          </button>
          <p className="text-center text-xs text-[#5F6B73] mt-3">
            Ada kendala? Hubungi admin{" "}
            <a href={ADMIN_WHATSAPP} target="_blank" rel="noreferrer" className="font-bold text-[#D21624] underline">
              {ADMIN_WHATSAPP_DISPLAY}
            </a>
          </p>
        </div>
      </div>

      <aside className="card p-5 lg:sticky lg:top-24">
        <div className="flex items-center justify-between border-b border-[#D7CEC1] pb-3">
          <div className="kicker text-[#D21624]">Rincian</div>
          <Icon name="card" size={16} stroke="#1664B0" />
        </div>
        <div className="mt-3 space-y-2.5 text-sm">
          {summaryRows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <span className="text-[#5F6B73]">{k}</span>
              <b className={`text-right ${k.startsWith("Promo") ? "text-[#1664B0]" : ""}`}>{v}</b>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t-2 border-[#12222E] flex justify-between items-baseline">
          <span className="text-[10px] font-bold uppercase tracking-[.16em] text-[#5F6B73]">Total</span>
          <span className="disp text-2xl font-extrabold">{rp(total)}</span>
        </div>
        <p className="text-[11px] text-[#5F6B73] mt-3">
          Pembayaran diverifikasi manual. Status berubah menjadi Diproses setelah kamu konfirmasi.
        </p>
      </aside>
    </div>
  );
}
