import { Icon } from "./Icons";
import type { Service } from "@/lib/services";

export function ServiceHero({ service, index }: { service: Service; index: number }) {
  return (
    <section className="bg-[#EFE8DE] border-y-2 border-[#1664B0]">
      <div className="max-w-4xl mx-auto px-5 py-6 md:py-8 grid grid-cols-[1fr_auto] gap-5 items-start">
        <div>
          <div className="kicker text-[#D21624]">
            Layanan / {String(index + 1).padStart(2, "0")} / {service.slug}
          </div>
          <h1 className="mt-2 text-3xl md:text-5xl font-extrabold text-[#1664B0]">{service.title}</h1>
          <p className="mt-2 text-sm md:text-base text-[#3E4A52] max-w-2xl leading-relaxed">
            {service.description}
          </p>
        </div>
        <span
          className="w-12 h-12 md:w-14 md:h-14 shrink-0 grid place-items-center border-2 border-[#1664B0]"
          style={{ background: service.icon.bg }}
        >
          <Icon name={service.icon.name} size={24} stroke={service.icon.stroke} />
        </span>
      </div>
    </section>
  );
}
