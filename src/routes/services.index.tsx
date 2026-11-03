import { createFileRoute } from "@tanstack/react-router";
import { CardLink, ContentSection, PrimaryAction, PublicPage } from "@/features/public/PublicPage";
import { serviceContent } from "@/features/public/serviceContent";

export const Route = createFileRoute("/services/")({
  head: () => ({ meta: [{ title: "Services — SOS India" }, { name: "description", content: "Explore SOS India's maritime consultancy, ship inspection, ship recycling, and training services." }] }),
  component: ServicesPage,
});

function ServicesPage() {
  const groups = Array.from(new Set(serviceContent.map((service) => service.group)));
  return <PublicPage eyebrow="Services" title="Maritime support, organized around your work" intro="Explore SOS India's services for vessel operations, hazardous materials, ship surveys, ship recycling, and workforce training.">
    <div className="mb-10"><PrimaryAction /></div>
    {groups.map((group) => <ContentSection key={group} title={group}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{serviceContent.filter((service) => service.group === group).map((service) => <CardLink key={service.slug} to={`/services/${service.slug}`} title={service.title} description={service.short} />)}</div>
    </ContentSection>)}
    <p className="mt-6 text-sm text-slate-500">Service scope and applicable requirements are confirmed for each engagement.</p>
  </PublicPage>;
}
