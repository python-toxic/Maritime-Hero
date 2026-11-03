import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function PublicPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return <div className="min-h-[70vh] bg-[#f7f8fa] text-[#102544]">
    <header className="border-b border-slate-200 bg-white px-5 py-14 sm:px-8 sm:py-20 lg:px-[8vw]">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl font-serif text-[clamp(2.3rem,5vw,4.5rem)] leading-[1.02] tracking-tight">{title}</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{intro}</p>
      </div>
    </header>
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">{children}</div>
  </div>;
}

export function ContentSection({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return <section id={id} className="scroll-mt-28 border-t border-slate-200 py-8 first:border-0 first:pt-0 sm:py-10">
    <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
    <div className="mt-4 max-w-4xl text-[15px] leading-7 text-slate-600">{children}</div>
  </section>;
}

export function PrimaryAction({ to = "/contact", children = "Request a Quote" }: { to?: string; children?: ReactNode }) {
  return <Link to={to as any} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#102544] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#193656] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2">{children}<ArrowRight className="h-4 w-4" /></Link>;
}

export function CardLink({ to, title, description }: { to: string; title: string; description: string }) {
  return <Link to={to as any} className="group rounded-lg border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 sm:p-6">
    <h3 className="text-lg font-semibold text-[#102544]">{title}<ArrowRight className="ml-2 inline h-4 w-4 text-sky-700 transition group-hover:translate-x-1" /></h3>
    <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
  </Link>;
}
