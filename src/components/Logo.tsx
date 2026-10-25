export function Logo({ variant = "default" }: { variant?: "default" | "light" }) {
  const circle = variant === "light" ? "#EFE8DE" : "#1664B0";
  const line = variant === "light" ? "#1664B0" : "#EFE8DE";
  const name = variant === "light" ? "#EFE8DE" : "#12222E";
  const sub = variant === "light" ? "rgba(239,232,222,.65)" : "#1664B0";

  return (
    <span
      className="inline-flex items-center gap-2.5"
      data-logo="sanuxia-axis"
      role="img"
      aria-label="Sanuxia Global"
    >
      <svg width="36" height="36" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="19" fill={circle} />
        <ellipse
          cx="20"
          cy="20"
          rx="7.5"
          ry="19"
          fill="none"
          stroke={line}
          strokeWidth="1.2"
          opacity="0.5"
        />
        <path d="M1 20h38" stroke={line} strokeWidth="1.2" opacity="0.5" />
        <path d="M29 7 11 33" stroke="#D21624" strokeWidth="3" strokeLinecap="round" />
        <circle cx="29" cy="7" r="2.2" fill="#D21624" />
      </svg>

      <span className="flex flex-col">
        <span className="disp text-[21px] font-bold leading-none tracking-[-.05em]" style={{ color: name }}>
          sanuxia
        </span>
        <span className="text-[8px] font-bold uppercase tracking-[.28em] mt-1" style={{ color: sub }}>
          Global PPOB
        </span>
      </span>
    </span>
  );
}
