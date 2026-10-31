import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { ServiceAppBar } from "@/components/ServiceAppBar";
import { ServiceHero } from "@/components/ServiceHero";
import { ServiceForm } from "@/components/ServiceForm";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { services, serviceBySlug } from "@/lib/services";
import { getHydratedService } from "@/lib/catalog-hydrate";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = serviceBySlug(slug);
  if (!service) return {};
  return {
    title: `${service.name} · Sanuxia Global`,
    description: service.description,
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { services: hydratedServices, games, service } = await getHydratedService(slug);
  if (!service) notFound();

  const others = hydratedServices.filter((s) => s.slug !== service.slug);
  const index = services.findIndex((s) => s.slug === service.slug);

  return (
    <>
      <ServiceAppBar service={service} />
      <div className="hidden lg:block">
        <Header />
      </div>

      <main className="pb-8">
        <div className="max-w-4xl mx-auto px-4 md:px-5">
          <Breadcrumbs
            items={[
              { label: "Beranda", href: "/" },
              { label: "Layanan", href: "/#layanan" },
              { label: service.title, href: `/layanan/${service.slug}/` },
            ]}
          />
        </div>

        <ServiceHero service={service} index={index} />

        <div className="px-4 md:px-5 pt-4 md:pt-6">
          <ServiceForm service={service} others={others} games={games} />
        </div>
      </main>
    </>
  );
}
