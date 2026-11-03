import { createFileRoute } from "@tanstack/react-router";
import { CardLink, ContentSection, PublicPage } from "@/features/public/PublicPage";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About SOS India" }, { name: "description", content: "Learn about SOS India, its maritime consultancy and training work, team, and locations." }] }),
  component: AboutPage,
});

function AboutPage() {
  return <PublicPage eyebrow="About SOS India" title="Maritime consultancy and training" intro="Solution Overall for Shipping India (SOS) Pvt. Ltd. works across ship recycling consultancy, Inventory of Hazardous Materials, vessel surveys, technical management, and maritime training.">
    <ContentSection title="Our work"><p>SOS India's service areas span vessel documentation and hazardous-material management, surveys and inspection, ship recycling support, technical management, and workforce training. Each engagement is scoped around the vessel, facility, or team requirement.</p></ContentSection>
    <ContentSection title="Leadership" id="leadership"><div className="grid gap-4 sm:grid-cols-2"><article className="rounded-lg border border-slate-200 bg-white p-6"><p className="text-xs font-semibold uppercase tracking-wider text-sky-700">Managing Director / CEO</p><h3 className="mt-2 text-xl font-semibold">Ravi Sharma</h3></article><article className="rounded-lg border border-slate-200 bg-white p-6"><p className="text-xs font-semibold uppercase tracking-wider text-sky-700">Executive Director &amp; COO</p><h3 className="mt-2 text-xl font-semibold">Capt. Dileep Pandey</h3></article></div></ContentSection>
    <ContentSection title="Explore SOS India"><div className="grid gap-4 md:grid-cols-2"><CardLink to="/services" title="Services" description="Browse vessel, recycling, and training capabilities." /><CardLink to="/credentials" title="Credentials and approvals" description="Review credential categories and find certificate verification." /><CardLink to="/contact" title="Locations and contact" description="Reach the SOS India team and view office locations." /><CardLink to="/careers" title="Careers" description="Find information about working with SOS India." /></div></ContentSection>
  </PublicPage>;
}
