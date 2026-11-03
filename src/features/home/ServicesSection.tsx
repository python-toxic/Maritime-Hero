
import { Link } from "@tanstack/react-router";

export type ServiceCardData = {
  id: number;
  title: string;
  description: string;
  image: string;
  slug: string;
  href: string;
  published: boolean;
  priority: number;
};

export const serviceCatalog: ServiceCardData[] = [
  {
    id: 1,
    title: "IHM Services",
    description:
      "Preparation, review and maintenance of Inventory of Hazardous Materials in compliance with international regulations.",
    image:
      "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1200&q=80",
    slug: "ihm-services",
    href: "/services/ihm-services",
    published: true,
    priority: 1,
  },
  {
    id: 2,
    title: "Asbestos Management",
    description:
      "Comprehensive asbestos surveys, risk assessment and management solutions for safe and compliant vessel operations.",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    slug: "asbestos-management",
    href: "/services/asbestos-management",
    published: true,
    priority: 2,
  },
  {
    id: 3,
    title: "Ship Surveys & Inspection",
    description:
      "Independent surveys and inspections to ensure regulatory compliance, operational safety and asset integrity.",
    image:
      "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80",
    slug: "ship-surveys-inspection",
    href: "/services/ship-surveys-inspection",
    published: true,
    priority: 3,
  },
  {
    id: 4,
    title: "Green Ship Recycling",
    description:
      "Environmentally responsible ship recycling solutions aligned with international standards and sustainable practices.",
    image:
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80",
    slug: "green-ship-recycling",
    href: "/services/green-ship-recycling",
    published: true,
    priority: 4,
  },
  {
    id: 5,
    title: "Technical Management",
    description:
      "End-to-end technical management to enhance vessel performance, ensure compliance and optimise operational efficiency.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    slug: "technical-management",
    href: "/services/technical-management",
    published: true,
    priority: 5,
  },
  {
    id: 6,
    title: "Training & Awareness",
    description:
      "Specialised training programs to build knowledge, ensure compliance and promote a culture of safety across the maritime industry.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    slug: "training-awareness",
    href: "/services/training-awareness",
    published: true,
    priority: 6,
  },
];

const brandSerif = {
  fontFamily: '"DM Serif Display", serif',
};

export function ServicesSection() {
  const visibleServices = serviceCatalog
    .filter((service) => service.published)
    .sort((a, b) => a.priority - b.priority);

  return (
    <section
      id="services"
      className="bg-[#ffffff] px-6 pt-20 pb-24 text-[#102544] sm:px-8 lg:px-[6.35vw] lg:pt-24 lg:pb-28"
    >
      <div className="mx-auto max-w-[1440px]">

        {/* Section heading and description */}
        <div className="mb-9 flex flex-col items-center gap-7 text-center md:mb-10">

          {/* Centered section heading */}
          <div className="flex flex-col items-center">
            <div className="mb-5 flex items-center justify-center gap-3">
              <span className="h-px w-12 bg-[#0d203d] opacity-75" />

              <p className="text-[0.74rem] font-medium uppercase tracking-[0.24em] text-[#203957]">
                Our Services
              </p>

              <span className="h-px w-12 bg-[#0d203d] opacity-75" />
            </div>

            <h2
              className="max-w-[680px] text-[clamp(2.5rem,4vw,4rem)] leading-[0.98] tracking-[-0.045em] text-[#102544]"
              style={{
                ...brandSerif,
                fontWeight: 400,
              }}
            >
              Comprehensive Maritime
              <span className="block">Solutions</span>
            </h2>
          </div>

          {/* Description and CTA grouped beneath the heading */}
          <div className="flex flex-col items-center gap-5 border-t border-[#d9dde3] pt-5">
            <p className="max-w-[520px] text-[0.98rem] leading-[1.65] text-[#64748b]">
              From regulatory compliance to sustainable recycling, we provide
              end-to-end maritime services that support safer operations,
              greater efficiency and a more sustainable future.
            </p>

            <Link
              to="/services"
              className="inline-flex items-center border-b border-[#203957] pb-1 text-[0.9rem] font-medium text-[#203957] transition-colors hover:text-[#0f2745]"
            >
              View All Services
              <span className="ml-2 text-lg">→</span>
            </Link>
          </div>
        </div>

        {/* Service cards */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleServices.map((service) => (
            <article
              key={service.id}
              className="group overflow-hidden rounded-xl border border-[#dfe5eb]  bg-[#ffffff] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(16,37,68,0.08)]"
            >
              {/* Image */}
              <div className="overflow-hidden border-b border-[#dfe5eb] bg-slate-200">
                <img
                  src={service.image}
                  alt={service.title}
                  loading="lazy"
                  className="h-[200px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] sm:h-[220px]"
                />
              </div>

              {/* Card content */}
              <div className="flex min-h-[224px] flex-col p-5 md:p-6">
                <h3
                  className="mb-3 text-[clamp(1.45rem,1.8vw,2rem)] leading-[1.12] tracking-[-0.035em] text-[#102544]"
                  style={{
                    ...brandSerif,
                    fontWeight: 400,
                  }}
                >
                  {service.title}
                </h3>

                <p className="flex-1 text-[1rem] leading-[1.55] text-[#64748b]">
                  {service.description}
                </p>

                <div className="mt-5 pt-2">
                  <Link
                    to={service.href as any}
                    className="inline-flex items-center border-b border-[#203957] pb-1 text-[0.94rem] font-medium text-[#203957] transition-colors hover:text-[#0f2745]"
                  >
                    Learn More
                    <span className="ml-2 text-lg">→</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
