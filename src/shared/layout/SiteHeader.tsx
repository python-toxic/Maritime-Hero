import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type MenuName = "Services" | "Training" | "Insights" | "About SOS";

const serviceGroups = [
  {
    title: "Vessel operations & compliance",
    links: [
      ["Inventory of Hazardous Materials (IHM)", "/services/ihm-services"],
      ["Asbestos Management", "/services/asbestos-management"],
      ["Ship Surveys and Inspection", "/services/ship-surveys-inspection"],
      ["Technical Management", "/services/technical-management"],
    ],
  },
  {
    title: "Ship recycling & facilities",
    links: [
      ["Green Ship Recycling", "/services/green-ship-recycling"],
      ["Recycling facility support", "/services/green-ship-recycling#facility-support"],
    ],
  },
  {
    title: "Workforce capability",
    links: [["Training and Awareness", "/services/training-awareness"]],
  },
];

const menuData: Record<Exclude<MenuName, "Services">, { intro: string; groups: { title: string; links: [string, string][] }[] }> = {
  Training: {
    intro: "Training for ship, shore, and ship-recycling teams.",
    groups: [
      { title: "Course catalogue", links: [["Browse available courses", "/training#courses"], ["IHM awareness", "/training#course-ihm-awareness"], ["General safety induction", "/training#course-general-safety-induction"], ["Hazardous-materials management", "/training#course-hazardous-materials-management"], ["Fire safety", "/training#course-fire-safety"], ["Confined-space entry", "/training#course-confined-space-entry"], ["Emergency response", "/training#course-emergency-response"]] },
      { title: "For teams", links: [["Training approach", "/training#training"], ["Request group training", "/contact?subject=Training"]] },
    ],
  },
  Insights: {
    intro: "Practical information on maritime services, safety, and ship recycling.",
    groups: [
      { title: "Articles and updates", links: [["Browse latest insights", "/insights"]] },
      { title: "Help and guidance", links: [["Frequently asked questions", "/faq"]] },
    ],
  },
  "About SOS": {
    intro: "Learn about SOS India, its people, credentials, and locations.",
    groups: [
      { title: "Company", links: [["About SOS India", "/about"], ["Leadership", "/about#leadership"], ["Locations and contact", "/contact"], ["Careers and job openings", "/careers"]] },
      { title: "Credentials", links: [["Certifications and approvals", "/credentials"], ["Verify a certificate", "/certificate-verification"]] },
    ],
  },
};

const menuNames: MenuName[] = ["Services", "Training", "Insights", "About SOS"];

export function SiteHeader() {
  const [openMenu, setOpenMenu] = useState<MenuName | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeServiceGroup, setActiveServiceGroup] = useState(serviceGroups[0].title);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!openMenu && !mobileOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenu, mobileOpen]);

  const headerPosition = isHome && !scrolled ? "absolute" : isHome ? "fixed" : "sticky";
  const headerAppearance = isHome && !scrolled && !openMenu
    ? "border-transparent bg-transparent"
    : "border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl";

  const renderMenuLink = ([label, href]: [string, string]) => (
    <Link key={`${label}-${href}`} to={href as any} onClick={() => { setOpenMenu(null); setMobileOpen(false); }} className="group flex items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-[#102544] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600">
      <span>{label}</span><ArrowRight className="h-4 w-4 text-sky-600 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100" />
    </Link>
  );

  return (
    <header ref={headerRef} className={`${headerPosition} top-0 z-50 w-full border-b transition-[background-color,border-color,box-shadow] duration-300 ${headerAppearance}`}>
      <div className="mx-auto flex h-[72px] w-full items-center justify-between gap-4 px-5 sm:px-8 lg:px-[5vw]">
        <Link to="/" aria-label="SOS India home" onClick={() => setOpenMenu(null)} className="flex shrink-0 items-center text-[#102544]">
          <span className="flex items-baseline leading-none" style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", Georgia, serif' }}>
            <span className="text-[2rem] font-semibold tracking-[-0.075em]">SOS</span>
            <span className="ml-1.5 text-[1.05rem] tracking-[0.02em] text-slate-600">INDIA</span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden h-full flex-1 items-center justify-center gap-2 lg:flex xl:gap-5">
          {menuNames.map((name) => (
            <button key={name} type="button" aria-expanded={openMenu === name} aria-controls="site-mega-menu" onClick={() => setOpenMenu((current) => current === name ? null : name)} className={`inline-flex h-full items-center gap-2 border-b-2 px-3 text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-600 ${openMenu === name ? "border-sky-600 text-[#102544]" : "border-transparent text-slate-700 hover:text-[#102544]"}`}>
              {name}<ChevronDown className={`h-4 w-4 text-sky-600 transition-transform ${openMenu === name ? "rotate-180" : ""}`} />
            </button>
          ))}
        </nav>

        <div className="hidden shrink-0 lg:flex">
          <Link to="/contact" className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-[#102544] px-5 text-sm font-medium text-white transition-colors hover:bg-[#193656] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2">Request a Quote <ArrowRight className="h-4 w-4" /></Link>
        </div>

        <button type="button" aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen} onClick={() => { setMobileOpen((value) => !value); setOpenMenu(null); }} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-[#102544] lg:hidden">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {openMenu && (
        <>
          <button type="button" aria-label="Close navigation menu" onClick={() => setOpenMenu(null)} className="fixed inset-x-0 bottom-0 top-[72px] z-40 hidden bg-slate-950/35 lg:block" />
          <div id="site-mega-menu" className="absolute left-0 right-0 top-full z-50 hidden border-t border-slate-200 bg-white shadow-[0_24px_50px_rgba(15,37,71,0.16)] lg:block">
            <div className="mx-auto max-w-[1440px] px-8 py-8 xl:px-12">
              <div className="mb-7 flex items-center justify-between gap-4">
                <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Explore SOS India</p><h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#102544]">{openMenu}</h2></div>
                <Link to={openMenu === "Services" ? "/services" : openMenu === "Training" ? "/training" : openMenu === "Insights" ? "/insights" : "/about"} onClick={() => setOpenMenu(null)} className="inline-flex items-center gap-2 text-sm font-medium text-[#174b8c] hover:underline">{openMenu === "Services" ? "View all services" : `Explore ${openMenu}`} <ArrowRight className="h-4 w-4" /></Link>
              </div>
              {openMenu === "Services" ? (
                <div className="grid min-h-[300px] grid-cols-[270px_minmax(0,1fr)]">
                  <div className="border-r border-slate-200 pr-5">
                    {serviceGroups.map((group) => <button key={group.title} type="button" aria-pressed={activeServiceGroup === group.title} onClick={() => setActiveServiceGroup(group.title)} className={`group flex w-full items-center justify-between gap-3 rounded-md px-4 py-3 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${activeServiceGroup === group.title ? "bg-[#f3f7fb] font-semibold text-[#174b8c]" : "text-slate-700 hover:bg-slate-50 hover:text-[#102544]"}`}><span>{group.title}</span><ArrowRight className={`h-4 w-4 ${activeServiceGroup === group.title ? "text-sky-700" : "text-slate-400"}`} /></button>)}
                  </div>
                  <section className="flex flex-col pl-8">
                    <h3 className="text-lg font-semibold text-[#102544]">{activeServiceGroup}</h3>
                    <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-1">{serviceGroups.find((group) => group.title === activeServiceGroup)?.links.map((link) => renderMenuLink(link as [string, string]))}</div>
                    <aside className="mt-auto flex flex-wrap items-center justify-between gap-4 rounded-lg bg-[#f3f7fb] px-5 py-4">
                      <div><p className="text-sm font-semibold text-[#102544]">Need help choosing a service?</p><p className="mt-1 text-sm text-slate-600">Tell us about your vessel or facility requirement.</p></div>
                      <Link to="/contact?subject=Services" onClick={() => setOpenMenu(null)} className="inline-flex items-center gap-2 text-sm font-semibold text-[#174b8c]">Discuss a requirement <ArrowRight className="h-4 w-4" /></Link>
                    </aside>
                  </section>
                </div>
              ) : (
                <div className="grid grid-cols-[minmax(240px,0.6fr)_minmax(0,1.4fr)] gap-10">
                  <p className="max-w-xs text-base leading-7 text-slate-600">{menuData[openMenu].intro}</p>
                  <div className="grid grid-cols-2 gap-8">{menuData[openMenu].groups.map((group) => <section key={group.title}><h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{group.title}</h3><div className="-mx-3">{group.links.map(renderMenuLink)}</div></section>)}</div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {mobileOpen && <nav aria-label="Mobile navigation" className="max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-slate-200 bg-white px-5 py-4 shadow-lg lg:hidden">
        {menuNames.map((name) => <section key={name} className="border-b border-slate-100 py-1"><button type="button" aria-expanded={openMenu === name} onClick={() => setOpenMenu((current) => current === name ? null : name)} className="flex w-full items-center justify-between py-3 text-left text-base font-medium text-[#102544]">{name}<ChevronDown className={`h-4 w-4 text-sky-700 transition-transform ${openMenu === name ? "rotate-180" : ""}`} /></button>
          {openMenu === name && <div className="pb-3 pl-2">{name === "Services" ? <>{serviceGroups.map((group) => <div key={group.title} className="mb-3"><p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{group.title}</p>{group.links.map((link) => renderMenuLink(link as [string, string]))}</div>)}{renderMenuLink(["View all services", "/services"])}</> : <>{menuData[name].groups.map((group) => <div key={group.title} className="mb-3"><p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{group.title}</p>{group.links.map(renderMenuLink)}</div>)}</>}</div>}
        </section>)}
        <Link to="/contact" onClick={() => setMobileOpen(false)} className="mt-4 flex h-12 items-center justify-center gap-2 rounded-md bg-[#102544] px-4 text-sm font-medium text-white">Request a Quote <ArrowRight className="h-4 w-4" /></Link>
      </nav>}
    </header>
  );
}
