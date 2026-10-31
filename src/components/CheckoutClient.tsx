"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "./Icons";
import { rp } from "@/lib/format";
import {
  ADMIN_WHATSAPP,
  ADMIN_WHATSAPP_DISPLAY,
  QRIS_IMAGE,
  loadOrder,
} from "@/lib/store";
import type { Order } from "@/lib/store";
import { createOrder } from "@/lib/db/client";
import { toPublicError } from "@/lib/db/errors";

export function CheckoutClient({
  brandSlug,
  qrisMethodId,
  qrisImageUrl,
}: {
  brandSlug: string;
  qrisMethodId: string | null;
  qrisImageUrl: string | null;
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [ready, setReady] = useState(false);
  const [inv, setInv] = useState("");
  const [expiresAt, setExpiresAt] = useState(0);
  const [orderTotal, setOrderTotal] = useState(0);
  const [left, setLeft] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [paid, setPaid] = useState(false);
  const [creating, setCreating] = useState(false);
  const [payError, setPayError] = useState("");

  const createdRef = useRef(false);

  useEffect(() => {
    setOrder(loadOrder());
    setReady(true);
  }, []);

  async function create() {
    if (!order?.dbServiceId || !order.dbProductId || !order.target) {
      setPayError("Data pesanan belum lengkap. Ulangi dari halaman layanan.");
      createdRef.current = false;
      return;
    }
    if (!qrisMethodId || !brandSlug) {
      setPayError("Pembayaran belum tersedia. Coba lagi sebentar.");
      createdRef.current = false;
      return;
    }

    setCreating(true);
    setPayError("");
    try {
      const created = await createOrder({
        brandSlug,
        serviceId: order.dbServiceId,
        productId: order.dbProductId,
        nomorTujuan: order.target,
        input: { ...(order.input ?? {}), nomor_tujuan: order.target },
        paymentMethodId: qrisMethodId,
      });
      setInv(created.ref);
      setOrderTotal(created.total);
      setExpiresAt(new Date(created.expires_at).getTime());
      setLeft(Math.max(1, Math.ceil((new Date(created.expires_at).getTime() - Date.now()) / 1000)));
      setTimedOut(false);
    } catch (orderFailure) {
      setPayError(toPublicError(orderFailure).message);
      createdRef.current = false;
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    if (!ready || !order || createdRef.current) return;
    createdRef.current = true;
    void create();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, order]);

  useEffect(() => {
    if (!expiresAt || paid) return;
    const tick = () => {
      const next = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setLeft(next);
      if (next <= 0) setTimedOut(true);
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt, paid]);

  const total = order ? order.price + order.admin : 0;
  const displayTotal = inv && orderTotal ? orderTotal : total;

  const summaryRows = useMemo(() => {
    if (!order) return [];
    const rows: [string, string][] = order.lines.map(([key, value]) => [key, value]);
    rows.push(["Harga", rp(order.price)]);
    if (order.admin) rows.push(["Biaya admin", rp(order.admin)]);
    rows.push(["Biaya layanan (QRIS)", "Gratis"]);
    return rows;
  }, [order]);

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
              {order.lines.map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4">
                  <span className="text-[#5F6B73]">{key}</span>
                  <b className="text-right">{value}</b>
                </div>
              ))}
              <div className="flex justify-between gap-4">
                <span className="text-[#5F6B73]">Metode</span>
                <b>QRIS</b>
              </div>
              <div className="flex justify-between gap-4 pt-2 border-t border-[#D7CEC1]">
                <span className="text-[#5F6B73]">Total pembayaran</span>
                <b className="text-lg">{rp(displayTotal)}</b>
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
              <div className="font-mono text-xl font-bold mt-1">
                {inv || (creating ? "Menyiapkan pembayaran…" : "—")}
              </div>
            </div>
            <div className="sm:text-right">
              <div className="text-[10px] font-bold uppercase tracking-[.16em] text-[#EFE8DE]/60">
                Selesaikan dalam
              </div>
              <div className="disp text-2xl font-extrabold mt-0.5">
                {!inv
                  ? "—"
                  : timedOut
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
            <div className="text-[10px] font-bold text-[#1664B0]">Gratis</div>
          </div>

          <div className="kicker text-[#D21624] mt-5">02 / Bayar</div>

          {payError ? (
            <div className="mt-2 border border-[#D21624] bg-[#FFF5F5] p-3 text-xs text-[#C81E3C]">
              <p className="font-bold">{payError}</p>
              <button
                type="button"
                onClick={() => {
                  if (!creating) {
                    createdRef.current = true;
                    void create();
                  }
                }}
                className="mt-2 border border-[#D21624] px-3 py-1.5 font-bold text-[#D21624]"
              >
                Coba lagi
              </button>
            </div>
          ) : null}

          <div className="mt-2 border border-[#D7CEC1] bg-[#EFE8DE] p-3 md:p-4">
            <div className="mx-auto max-w-[320px] bg-white border border-[#D7CEC1] p-2.5">
              <img
                src={qrisImageUrl || QRIS_IMAGE}
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
                <div className="disp text-xl font-extrabold mt-0.5">{rp(displayTotal)}</div>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#1664B0]">QRIS</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPaid(true)}
            disabled={timedOut || creating || !inv}
            className="btn w-full mt-4 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating ? "Menyiapkan…" : "Saya sudah bayar"}
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
          {summaryRows.map(([key, value]) => (
            <div key={key} className="flex justify-between gap-3">
              <span className="text-[#5F6B73]">{key}</span>
              <b className="text-right">{value}</b>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t-2 border-[#12222E] flex justify-between items-baseline">
          <span className="text-[10px] font-bold uppercase tracking-[.16em] text-[#5F6B73]">Total</span>
          <span className="disp text-2xl font-extrabold">{rp(displayTotal)}</span>
        </div>
        <p className="text-[11px] text-[#5F6B73] mt-3">
          Pembayaran diverifikasi manual. Status berubah menjadi Diproses setelah kamu konfirmasi.
        </p>
      </aside>
    </div>
  );
}
