import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Mail } from "lucide-react";
import { ContentSection, PublicPage } from "@/features/public/PublicPage";

export const Route = createFileRoute("/certificate-verification")({
  head: () => ({ meta: [{ title: "Certificate Verification — SOS India" }, { name: "description", content: "Contact SOS India to request verification of a training or service certificate." }] }),
  component: CertificateVerificationPage,
});

function CertificateVerificationPage() {
  return <PublicPage eyebrow="Credentials" title="Verify a certificate" intro="Send the certificate reference to SOS India so the team can review the record and confirm the relevant details.">
    <ContentSection title="What to include"><ol className="list-decimal space-y-2 pl-5"><li>Certificate or reference number.</li><li>Name of the person or organization shown on the certificate.</li><li>Course or service name and issue date, if available.</li><li>A copy of the certificate, if needed to identify the record.</li></ol></ContentSection>
    <div className="mt-6 rounded-lg border border-sky-200 bg-sky-50 p-6"><p className="max-w-2xl text-sm leading-6 text-slate-700">This page provides a contact route for verification requests. It does not perform an automatic certificate lookup.</p><a href="mailto:info@sosindi.com?subject=Certificate%20verification%20request" className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#102544] px-5 py-3 text-sm font-semibold text-white hover:bg-[#193656]"><Mail className="h-4 w-4" /> Email SOS India</a></div>
    <Link to="/credentials" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-sky-800">Back to credentials <ArrowRight className="h-4 w-4" /></Link>
  </PublicPage>;
}
