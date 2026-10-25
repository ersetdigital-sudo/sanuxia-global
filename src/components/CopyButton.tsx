"use client";

import { useState } from "react";

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard?.writeText(code);
        } catch {
          /* clipboard unavailable */
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      className="mt-5 inline-flex items-center gap-2 border border-[#EFE8DE]/40 px-4 py-2.5 text-xs font-bold text-[#EFE8DE] hover:bg-[#12222E]/20 transition"
    >
      <span className="font-mono tracking-wider">{code}</span>
      <span className="text-[#D21624] bg-[#EFE8DE] px-1.5 py-0.5">{copied ? "TERSALIN" : "SALIN"}</span>
    </button>
  );
}
