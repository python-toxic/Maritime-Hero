import { Link } from "@tanstack/react-router";
import { ArrowRight, Mail, Phone } from "lucide-react";

const destinations = [
  { title: "Insights", text: "Browse updates and articles on maritime services, safety, and ship recycling.", to: "/insights" },
  { title: "Frequently asked questions", text: "Find answers to common service, training, and compliance questions.", to: "/faq" },
  { title: "Credentials and verification", text: "Review credential categories or ask SOS India to verify a certificate.", to: "/credentials" },
];

export function NextStepsSection() {
  return <section className="bg-[#f4f7fa] px-5 py-16 sm:px-8 sm:py-20 lg:px-[6.35vw]">
    <div className="mx-auto max-w-[1440px]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-800">Continue exploring</p>
      <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><h2 className="max-w-2xl font-serif text-3xl leading-tight text-[#102544] sm:text-4xl">Useful information for your next step.</h2><Link to="/contact" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#174b8c]">Discuss a requirement <ArrowRight className="h-4 w-4" /></Link></div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">{destinations.map((item) => <Link key={item.title} to={item.to as any} className="group rounded-lg border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"><h3 className="font-semibold text-[#102544]">{item.title}<ArrowRight className="ml-2 inline h-4 w-4 text-sky-700 transition group-hover:translate-x-1" /></h3><p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p></Link>)}</div>
      <div className="mt-8 flex flex-col gap-5 rounded-lg bg-[#102544] p-6 text-white sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div><h3 className="text-xl font-semibold">Have a service or training requirement?</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">Share the details with the SOS India team to discuss scope and next steps.</p><div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm"><a className="inline-flex items-center gap-2 hover:underline" href="mailto:info@sosindi.com"><Mail className="h-4 w-4" />info@sosindi.com</a><a className="inline-flex items-center gap-2 hover:underline" href="tel:+918356929017"><Phone className="h-4 w-4" />+91 83569 29017</a></div></div>
        <Link to="/contact" className="inline-flex min-h-11 w-fit shrink-0 items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-[#102544] hover:bg-slate-100">Request a Quote <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </div>
  </section>;
}
