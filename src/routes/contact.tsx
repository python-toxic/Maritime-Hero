import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContentSection, PublicPage } from "@/features/public/PublicPage";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact SOS India" }, { name: "description", content: "Contact SOS India about maritime services, training, and ship recycling support." }] }),
  component: ContactPage,
});

function ContactPage() {
  const search = useSearch({ strict: false }) as { subject?: string };
  const subject = search.subject;
  const emailSubject = encodeURIComponent(subject ? `Enquiry: ${subject}` : "Enquiry for SOS India");
  const emailBody = encodeURIComponent(subject ? `Hello SOS India,\n\nI would like to discuss: ${subject}.\n\nPlease contact me about the next steps.\n` : "Hello SOS India,\n\nI would like to discuss a service or training requirement.\n\nPlease contact me about the next steps.\n");
  return <PublicPage eyebrow="Contact SOS India" title="Tell us what you need help with" intro="Share the service, vessel, facility, or training requirement you would like to discuss. The SOS India team can confirm the appropriate scope and next steps.">
    {subject && <p className="mb-8 rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-slate-700">Enquiry topic: <strong>{subject}</strong></p>}
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <section className="rounded-lg bg-[#102544] p-7 text-white sm:p-9"><h2 className="text-2xl font-semibold">Contact the team</h2><p className="mt-3 text-sm leading-6 text-slate-200">For a quote, include the service you are considering, relevant vessel or facility details, and your expected timeframe.</p><a href={`mailto:info@sosindi.com?subject=${emailSubject}&body=${emailBody}`} className="mt-6 inline-flex items-center gap-2 rounded-md bg-white px-4 py-3 text-sm font-semibold text-[#102544] hover:bg-slate-100"><Mail className="h-4 w-4" /> Email SOS India</a><a href="tel:+918356929017" className="mt-4 flex items-center gap-2 text-sm text-white"><Phone className="h-4 w-4" /> +91 83569 29017</a></section>
      <div className="space-y-4">
        <article className="rounded-lg border border-slate-200 bg-white p-6"><MapPin className="h-5 w-5 text-sky-700" /><h2 className="mt-3 font-semibold">Head office</h2><p className="mt-2 text-sm leading-6 text-slate-600">Office No. G-05, Plot No. 53, Punit Tower-2, Sector 11, CBD Belapur, Navi Mumbai, Maharashtra 400614, India.</p></article>
        <article className="rounded-lg border border-slate-200 bg-white p-6"><MapPin className="h-5 w-5 text-sky-700" /><h2 className="mt-3 font-semibold">Regional office</h2><p className="mt-2 text-sm leading-6 text-slate-600">303, Victoria Prime Building, Kaliyabid, Bhavnagar, Gujarat 364002.</p></article>
        <article className="rounded-lg border border-slate-200 bg-white p-6"><MapPin className="h-5 w-5 text-sky-700" /><h2 className="mt-3 font-semibold">Training centre</h2><p className="mt-2 text-sm leading-6 text-slate-600">1008, Trapaj, near Alang, Bhavnagar, Gujarat 364150.</p></article>
      </div>
    </div>
    <ContentSection title="Other useful pages"><p><Link to="/services" className="font-medium text-sky-800 underline">Browse services</Link> or <Link to="/training" className="font-medium text-sky-800 underline">explore training topics</Link>.</p></ContentSection>
  </PublicPage>;
}
