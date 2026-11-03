import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, FileCheck2, GraduationCap } from "lucide-react";
import { ContentSection, PublicPage } from "@/features/public/PublicPage";

export const Route = createFileRoute("/credentials")({
  head: () => ({ meta: [{ title: "Credentials and Approvals — SOS India" }] }),
  component: CredentialsPage,
});

function CredentialsPage() {
  const groups = [
    { icon: BadgeCheck, title: "Service approvals", text: "The company website lists Lloyd's Register and IR Class approvals for IHM services. Confirm the current approval scope and status directly with SOS India." },
    { icon: FileCheck2, title: "Quality certification", text: "The company website lists ISO 9001:2015 certification by LRQA for specified service areas. Current validity and scope should be confirmed before relying on this information." },
    { icon: GraduationCap, title: "Training and industry credentials", text: "Training and industry-related logos are displayed on the company website. Each affiliation, approval, or credential should be reviewed according to its issuing body and applicable scope." },
  ];
  return <PublicPage eyebrow="Trust and credentials" title="Credentials with clear scope" intro="Credentials matter when their issuing body, scope, and current status are clear. Contact SOS India to confirm the details that apply to a service or certificate.">
    <div className="grid gap-4 md:grid-cols-3">{groups.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-lg border border-slate-200 bg-white p-6"><Icon className="h-6 w-6 text-sky-700" /><h2 className="mt-5 text-lg font-semibold">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{text}</p></article>)}</div>
    <ContentSection title="Verify a certificate"><p>Use the certificate reference to ask SOS India for a verification. Include the certificate number and the organization or course name so the team can identify the record.</p><Link to="/certificate-verification" className="mt-4 inline-flex items-center gap-2 font-semibold text-sky-800">Certificate verification <ArrowRight className="h-4 w-4" /></Link></ContentSection>
  </PublicPage>;
}
