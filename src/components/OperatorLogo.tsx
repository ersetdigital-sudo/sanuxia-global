import { OPERATOR_LOGOS } from "@/lib/operators";

export function OperatorLogo({
  name,
  size = 18,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const src = OPERATOR_LOGOS[name];
  if (!src) return null;

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      className={`object-contain ${className}`}
    />
  );
}
