import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { ContentSection, PrimaryAction, PublicPage } from "@/features/public/PublicPage";
import { serviceContent } from "@/features/public/serviceContent";

export const Route = createFileRoute("/services/$slug")({
  head: ({ params }) => {
    const service = serviceContent.find((item) => item.slug === params.slug);
    return { meta: [{ title: `${service?.title ?? "Service"} — SOS India` }] };
  },
  component: ServiceDetailPage,
});

function ServiceDetailPage() {
  const { slug } = Route.useParams();
  const service = serviceContent.find((item) => item.slug === slug);
  if (!service) return <PublicPage eyebrow="Services" title="Service not found" intro="The service page may have moved. Browse the current service catalogue to find the right information."><Link to="/services" className="font-medium text-sky-800 underline">Browse all services</Link></PublicPage>;

  return <PublicPage eyebrow={`Services / ${service.group}`} title={service.title} intro={service.short}>
    <div className="mb-10 flex flex-wrap gap-3"><PrimaryAction to={`/contact?subject=${encodeURIComponent(service.title)}`} /><Link to="/services" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-[#102544] hover:bg-slate-50"><ArrowLeft className="h-4 w-4" /> All services</Link></div>
    <ContentSection title="About this service"><p>{service.summary}</p></ContentSection>
    <ContentSection title="Areas of support" id={slug === "green-ship-recycling" ? "facility-support" : undefined}>
      <ul className="grid gap-3 sm:grid-cols-2">{service.focus.map((item) => <li key={item} className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-4 text-slate-700"><Check className="mt-1 h-4 w-4 shrink-0 text-sky-700" />{item}</li>)}</ul>
    </ContentSection>
    <ContentSection title="Discuss your requirement"><p>Tell us about the vessel, facility, or training need and the work you are planning. SOS India can confirm the relevant scope and next steps with you.</p><div className="mt-5"><PrimaryAction to={`/contact?subject=${encodeURIComponent(service.title)}`} /></div></ContentSection>
  </PublicPage>;
}
