"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ADMIN_WHATSAPP, ADMIN_WHATSAPP_DISPLAY } from "@/lib/store";
import { rp } from "@/lib/format";

type Status = "success" | "processing" | "pending" | "expired";

type RemoteOrder = {
  inv: string;
  status: Status;
  service: string;
  product: string;
  lines: [string, string][];
  method: string;
  total: number;
  sn: string;
  label: string;
  created: number;
  paidAt?: number;
};

const STEPS = ["Dibuat", "Dibayar", "Diterima", "Diproses", "Selesai"];

const STATUS_LABEL: Record<Status, string> = {
  success: "Selesai",
  processing: "Sedang diproses",
  pending: "Menunggu bayar",
  expired: "Dibatalkan",
};

const dt = (t: number) =>
  new Date(t).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export function TrackClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [inv, setInv] = useState("");
  const [found, setFound] = useState<RemoteOrder | null>(null);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const show = useCallback(
    async (value: string, updateUrl = true) => {
      const code = (value || "").trim().toUpperCase();
      setError("");
      if (!code) {
        setFound(null);
        setMissing(false);
        return;
      }
      if (!/^SNX-[A-Z0-9-]{4,}$/.test(code)) {
        setFound(null);
        setMissing(false);
        setError("Format invoice belum tepat. Contoh: SNX-YYMMDD-XXXXXX.");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(code)}`, {
          headers: { accept: "application/json" },
        });
        if (!response.ok) {
          setFound(null);
          setMissing(true);
          return;
        }
        setFound((await response.json()) as RemoteOrder);
        setMissing(false);
        if (updateUrl) router.replace(`/cek-pesanan/?inv=${code}`, { scroll: false });
      } catch {
        setFound(null);
        setError("Gagal memeriksa pesanan. Coba lagi sebentar.");
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    const q = searchParams.get("inv");
    if (q) {
      setInv(q);
      void show(q, false);
    }
  }, [searchParams, show]);

  const status = found?.status ?? null;

  return (
    <>
      <div className="bg-[#EFE8DE] border border-[#D7CEC1] p-3 mt-5">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void show(inv);
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            value={inv}
            onChange={(event) => {
              setInv(event.target.value.toUpperCase());
              if (error) setError("");
            }}
            className="inp flex-1 font-mono uppercase"
            placeholder="SNX-YYMMDD-XXXXXX"
            autoComplete="off"
          />
          <button type="submit" disabled={loading} className="btn-blue shrink-0 disabled:opacity-60">
            {loading ? "Mencari…" : "Lacak"}
          </button>
        </form>
      </div>

      {error ? <p className="mt-3 text-sm font-semibold text-[#C81E3C]">{error}</p> : null}

      <div className="mt-5">
        {missing && (
          <div className="card p-8 text-center">
            <div className="disp text-3xl font-extrabold text-[#D21624]">404</div>
            <h2 className="text-lg font-bold mt-2">Invoice tidak ditemukan</h2>
            <p className="text-sm text-[#5F6B73] mt-1.5">
              Cek kembali nomor invoice dari halaman pembayaran.
            </p>
            <Link href="/#layanan" className="btn inline-block mt-4">
              Pesan ulang
            </Link>
          </div>
        )}

        {found && status && (
          <div className="card overflow-hidden">
            <div className="bg-[#1664B0] text-[#EFE8DE] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="kicker text-[#EFE8DE]/60">Manifest / Sanuxia Global</div>
                  <div className="font-mono text-xl md:text-2xl font-bold mt-1">{found.inv}</div>
                  <div className="text-xs text-[#EFE8DE]/70 mt-1">Dibuat {dt(found.created)}</div>
                </div>
                <span className="stamp bg-[#EFE8DE] px-2.5 py-1 text-[10px]">
                  {STATUS_LABEL[status]}
                </span>
              </div>
            </div>

            <div className="p-5 md:p-6">
              <div className="flex items-start">
                {STEPS.map((step, index) => {
                  const done =
                    status === "success" ||
                    (status === "processing" && index < 4) ||
                    (status === "pending" && index < 2);
                  return (
                    <div key={step} className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <span
                          className={`w-6 h-6 shrink-0 border-2 grid place-items-center text-[9px] font-bold ${
                            done
                              ? "bg-[#D21624] border-[#D21624] text-[#EFE8DE]"
                              : "bg-white border-[#C9C0B2] text-[#9A9083]"
                          }`}
                        >
                          {index + 1}
                        </span>
                        {index < STEPS.length - 1 && (
                          <span className={`h-0.5 flex-1 ${done ? "bg-[#D21624]" : "bg-[#D7CEC1]"}`} />
                        )}
                      </div>
                      <div
                        className={`mt-1.5 text-[9px] font-bold uppercase tracking-wider ${
                          done ? "text-[#12222E]" : "text-[#9A9083]"
                        }`}
                      >
                        {step}
                      </div>
                    </div>
                  );
                })}
              </div>

              {found.sn ? (
                <div className="mt-5 border border-[#1664B0] bg-[#EFE8DE] p-4 text-center">
                  <div className="kicker text-[#5F6B73]">{found.label || "SN / Token"}</div>
                  <div className="font-mono text-lg font-bold mt-1 break-all">{found.sn}</div>
                </div>
              ) : null}

              <div className="mt-5 border-t border-[#D7CEC1] pt-4 space-y-2.5 text-sm">
                {found.lines.map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4">
                    <span className="text-[#5F6B73]">{key}</span>
                    <b className="text-right break-all">{value}</b>
                  </div>
                ))}
                <div className="flex justify-between gap-4">
                  <span className="text-[#5F6B73]">Metode</span>
                  <b>{found.method}</b>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#5F6B73]">Total</span>
                  <b>{rp(found.total)}</b>
                </div>
              </div>

              {status === "processing" && (
                <div className="mt-4 bg-[#EFE8DE] border-l-4 border-[#1664B0] p-3.5">
                  <div className="text-xs font-bold">Pembayaran sedang diverifikasi</div>
                  <p className="text-xs text-[#5F6B73] mt-1">
                    Pesananmu sedang diproses admin. Simpan nomor invoice ini untuk pengecekan.
                  </p>
                </div>
              )}

              {status === "pending" && (
                <p className="mt-4 text-xs text-[#5F6B73]">
                  Pesanan menunggu pembayaran. Selesaikan pembayaran lalu konfirmasi ke admin.
                </p>
              )}

              {status === "expired" && (
                <Link href="/#layanan" className="btn inline-block mt-4">
                  Pesan ulang
                </Link>
              )}

              <div className="mt-5 pt-4 border-t border-[#D7CEC1] flex flex-wrap items-center justify-between gap-3">
                <a
                  href={ADMIN_WHATSAPP}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#5F6B73]"
                >
                  Bantuan: <b className="text-[#D21624] underline">{ADMIN_WHATSAPP_DISPLAY}</b>
                </a>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="border border-[#D7CEC1] px-3 py-2 text-[10px] font-bold uppercase tracking-wider hover:border-[#1664B0]"
                >
                  Simpan manifest
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
