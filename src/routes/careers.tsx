import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { ContentSection, PublicPage } from "@/features/public/PublicPage";

export const Route = createFileRoute("/careers")({
  head: () => ({ meta: [{ title: "Careers — SOS India" }] }),
  component: CareersPage,
});

function CareersPage() {
  return <PublicPage eyebrow="Careers" title="Work with SOS India" intro="SOS India works across maritime consultancy, ship recycling, vessel surveys, and training. Job openings will be listed here when the company has approved roles to share.">
    <ContentSection title="Current opportunities"><div className="rounded-lg border border-slate-200 bg-white p-6"><p>For information about current opportunities, contact the SOS India team.</p><a href="mailto:info@sosindi.com?subject=Careers%20enquiry" className="mt-5 inline-flex items-center gap-2 font-semibold text-sky-800"><Mail className="h-4 w-4" /> Email SOS India</a></div></ContentSection>
  </PublicPage>;
}
