import { Link } from "@tanstack/react-router";
import vesselImage from "../../../assets/Cargo-Vessel.png";

const brandSerif = {
  fontFamily: '"DM Serif Display", serif',
};

const brandSans = {
  fontFamily: "Inter, sans-serif",
};

const services = [
  {
    no: "01",
    title: "Inventory of Hazardous Materials",
    text: "Preparation, review and maintenance of vessel IHM documentation.",
  },
  {
    no: "02",
    title: "Ship surveys & inspection",
    text: "Independent technical surveys to support compliance and safety.",
  },
  {
    no: "03",
    title: "Green ship recycling",
    text: "Guidance for responsible and compliant vessel recycling.",
  },
  {
    no: "04",
    title: "Training & awareness",
    text: "Practical training for safe maritime operations.",
  },
];

export function AboutSection() {
  return (
    <section
      id="about"
      className="w-full overflow-hidden bg-white py-20 text-[#0f2547] lg:py-24"
    >
      <div className="mx-auto w-full max-w-[1580px] px-5 sm:px-8 lg:px-0">
        {/* ───────── Header ───────── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.78fr)] lg:gap-0 lg:px-[50px]">
          {/* Left: eyebrow + headline */}
          <div className="min-w-0">
            <div className="mb-5 flex items-center gap-4">
              <span className="h-px w-[46px] shrink-0 bg-[#0f2547]" />
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0f2547]"
                style={brandSans}
              >
                About SOS India
              </p>
            </div>

            <h2
              className="max-w-[820px] text-[clamp(2.4rem,4.4vw,4.35rem)] leading-[0.98] tracking-[-0.03em] text-[#0f2547]"
              style={brandSerif}
            >
              Maritime expertise for safer, more sustainable operations.
            </h2>
          </div>

          {/* Right: divider + description + link */}
          <div className="flex min-w-0 lg:border-l lg:border-[#d9dde3] lg:pl-[34px]">
            <div className="max-w-[560px] lg:mt-[30px]">
              <p
                className="text-[15px] leading-[1.8] text-[#5f76a0] lg:text-[16.5px]"
                style={brandSans}
              >
                Solution Overall For Shipping India (SOS) Pvt. Ltd. provides
                technical consultancy and training services for surveys,
                hazardous materials management and vessel recycling.
              </p>

              <Link
                to="/contact"
                className="mt-7 inline-flex items-center gap-4 border-b border-[#0f2547] pb-2 text-[15px] font-medium text-[#0f2547] transition-opacity hover:opacity-70"
                style={brandSans}
              >
                Contact our team
                <span className="h-px w-5 bg-[#0f2547]" />
              </Link>
            </div>
          </div>
        </div>

        {/* ───────── Image banner ───────── */}
        <div className="group relative mt-10 h-[340px] overflow-hidden rounded-[22px] sm:h-[400px] lg:mt-10 lg:h-[439px] lg:rounded-[30px]">
          <img
            src={vesselImage}
            alt="Vessel in dry dock at an Indian shipyard at sunset"
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
          />

          {/* Bottom gradient for caption legibility */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-[#0b1a33]/75 via-[#0b1a33]/30 to-transparent" />

          {/* Bottom-left caption */}
          <p
            className="absolute bottom-5 left-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white sm:left-8 lg:bottom-[26px] lg:left-[50px]"
            style={brandSans}
          >
            MARITIME SOLUTIONS WORLDWIDE
          </p>
        </div>

        {/* ───────── Services ───────── */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:mt-8 lg:grid-cols-4">
          {services.map((item, i) => (
            <div
              key={item.no}
              className={[
                "min-w-0 py-5 lg:py-0 lg:pl-[23px] lg:pr-8",
                i !== 0 ? "border-t border-[#e4e6ea] sm:[&:nth-child(2)]:border-t-0 lg:border-t-0 lg:border-l" : "",
                i === 2 ? "sm:border-t sm:border-[#e4e6ea] lg:border-t-0" : "",
                i === 3 ? "sm:border-l sm:border-[#e4e6ea]" : "",
              ].join(" ")}
            >
              <p
                className="text-[10px] font-semibold tracking-[0.18em] text-[#b4553a]"
                style={brandSans}
              >
                {item.no}
              </p>

              <h3
                className="mt-3 text-[22px] leading-[1.05] tracking-[-0.01em] text-[#0f2547]"
                style={brandSerif}
              >
                {item.title}
              </h3>

              <p
                className="mt-2 max-w-[300px] text-[14.5px] leading-[1.6] text-[#6a7fa3]"
                style={brandSans}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
