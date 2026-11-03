
import { Link } from "@tanstack/react-router";
import vesselImage from "../../../assets/BG-Vessel.png";

const brandSerif = {
  fontFamily: '"DM Serif Display", serif',
};

export function HeroSection() {
  return (
    <section className="relative isolate w-full overflow-hidden bg-[#f8f8f6] text-[#102544]">
      <img
        src={vesselImage}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="block h-auto w-full select-none"
      />

      {/* Allow text selection and interaction */}
      <div className="absolute inset-0 pointer-events-auto">
        <div className="absolute left-[5.7%] top-[24%] w-[48%] max-w-[740px]">
            <p
            className="mb-[1.6vw] select-text cursor-text text-[clamp(0.55rem,0.65vw,0.76rem)] font-medium uppercase tracking-[0.2em] text-[#405572]"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <span className="mr-5 inline-block w-8 align-middle border-t border-[#60728a]" />
            PEOPLE&nbsp; / &nbsp;EXPERTISE&nbsp; / &nbsp;A SAFER TOMORROW
          </p>

          <h1
            className="select-text cursor-text text-[clamp(2.2rem,4vw,4.8rem)] leading-[1.02] tracking-[-0.045em] text-[#102544]"
            style={{ ...brandSerif, fontWeight: 400 }}
          >
            <span className="block">Maritime Expertise</span>
            <span className="block">for a Safer, Stronger</span>
            <span className="block">Tomorrow</span>
          </h1>

          <p
            className="mt-[1.5vw] max-w-[540px] select-text cursor-text text-[clamp(0.75rem,0.9vw,1.05rem)] leading-[1.7] text-[#64748b]"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            SOS India supports vessel operations, hazardous-material management,
            ship recycling, surveys, and maritime training.
          </p>

          <div className="mt-[1.8vw] flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link
              to="/services"
              className="inline-flex items-center justify-center rounded-md bg-[#0d203d] px-5 py-3 text-[clamp(0.75rem,0.8vw,0.9rem)] font-medium text-white transition-colors hover:bg-[#193656]"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Explore Our Services
              <span className="ml-3 text-base leading-none">→</span>
            </Link>

            <Link
              to="/about"
              className="inline-flex items-center border-b border-[#8392a7] pb-1 text-[clamp(0.75rem,0.8vw,0.9rem)] font-medium text-[#172d4c] hover:border-[#102544]"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Learn About SOS India
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
