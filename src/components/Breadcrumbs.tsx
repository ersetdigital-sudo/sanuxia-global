import Link from "next/link";

type Crumb = { label: string; href: string };

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3004").replace(/\/$/, "");

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: `${SITE_URL}${item.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav data-breadcrumb aria-label="Breadcrumb" className="py-3">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold uppercase tracking-[.14em] text-[#5F6B73]">
          {items.map((item, i) => {
            const last = i === items.length - 1;
            return (
              <li key={`${item.href}-${item.label}`} className="flex items-center gap-2">
                {i > 0 && (
                  <span aria-hidden className="text-[#D21624]">
                    /
                  </span>
                )}
                {last ? (
                  <span aria-current="page" className="text-[#12222E]">
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href} className="hover:text-[#1664B0]">
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
