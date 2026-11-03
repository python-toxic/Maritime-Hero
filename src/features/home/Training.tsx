import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

type Course = {
  slug: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

const courses: Course[] = [
  {
    slug: "ihm-awareness",
    title: "IHM\nAwareness",
    description:
      "Identify hazardous materials on board and understand the documentation used to manage them safely.",
    image: "courses/training-ihm-awareness.png",
    imageAlt: "Ship safety officer looking out from the bridge toward the sea",
  },
  {
    slug: "general-safety-induction",
    title: "General\nSafety Induction",
    description:
      "Build a practical foundation in shipboard hazards, safe work practices and emergency procedures.",
    image: "courses/training-safety-induction.png",
    imageAlt: "Cargo vessel underway at sea in the evening light",
  },
  {
    slug: "hazardous-materials-management",
    title: "Hazardous\nMaterials\nManagement",
    description:
      "Learn practical approaches to identify, handle and document hazardous materials across ship and shore operations.",
    image: "courses/training-hazardous-materials.png",
    imageAlt: "Deck worker in protective clothing on a ship at sea",
  },
  {
    slug: "fire-safety",
    title: "Fire\nSafety",
    description:
      "Understand fire prevention, response procedures and safe use of onboard firefighting equipment.",
    image: "courses/training-fire-safety.png",
    imageAlt: "Marine fire hose and firefighting valve on a vessel deck",
  },
  {
    slug: "confined-space-entry",
    title: "Confined\nSpace Entry",
    description:
      "Learn how to assess enclosed spaces, prepare for entry and follow safe work and emergency procedures.",
    image: "courses/training-confined-space.png",
    imageAlt: "Orange lifeboat being lowered beside a ship at sea",
  },
  {
    slug: "emergency-response",
    title: "Emergency\nResponse",
    description:
      "Prepare for shipboard emergencies through clear response procedures, communication and coordinated action.",
    image: "courses/training-emergency-response.png",
    imageAlt: "Ship's compass on the bridge with the setting sun over the sea",
  },
];

const benefits = [
  { icon: BookOpen, first: "Industry", second: "Relevant" },
  { icon: Users, first: "For Ship &", second: "Shore Personnel" },
  { icon: ShieldCheck, first: "Safety", second: "Focused" },
];

const Styles = () => (
  <style>{`
    .training-bg {
      background: #fff;
    }

    .training-serif {
      font-family: "DM Serif Display", Georgia, serif;
      font-weight: 400;
    }

    .training-gallery-track {
      display: flex;
      align-items: center;
      gap: 12px;
      overflow-x: auto;
      min-height: 510px;
      padding: 28px 2px 32px;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }

    .training-gallery-track::-webkit-scrollbar {
      display: none;
    }

    .training-card {
      position: relative;
      display: flex;
      min-width: 0;
      flex: 0 0 min(78vw, 330px);
      height: 370px;
      flex-direction: column;
      overflow: hidden;
      border-radius: 15px;
      background: #fff;
      box-shadow: 0 12px 26px rgb(16 37 68 / 13%);
      scroll-snap-align: center;
      transition:
        flex 700ms cubic-bezier(.4, 0, .2, 1),
        height 700ms cubic-bezier(.4, 0, .2, 1),
        border-radius 350ms ease,
        box-shadow 350ms ease;
    }

    .training-card.is-active {
      height: 430px;
      box-shadow: 0 20px 38px rgb(16 37 68 / 17%);
    }

    .training-card-select {
      position: absolute;
      z-index: 10;
      inset: 0;
      border: 0;
      background: transparent;
      cursor: pointer;
    }

    .training-card-select:focus-visible {
      outline: 3px solid #d6a62b;
      outline-offset: -5px;
      border-radius: 15px;
    }

    .training-card-image-wrap {
      position: relative;
      min-height: 0;
      flex: 1 1 100%;
      overflow: hidden;
      transition: flex-basis 700ms cubic-bezier(.4, 0, .2, 1);
    }

    .training-card-image-wrap.is-expanded {
      flex: 0 0 44%;
    }

    .training-card-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      transition:
        transform 800ms cubic-bezier(.4, 0, .2, 1),
        filter 500ms ease;
    }

    .training-card-shade {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgb(7 21 40 / 0%) 35%, rgb(7 21 40 / 88%) 100%);
      transition: opacity 350ms ease;
    }

    .training-card.is-active .training-card-shade {
      opacity: 0;
    }

    .training-card-collapsed-content {
      position: absolute;
      z-index: 1;
      right: 18px;
      bottom: 17px;
      left: 18px;
      color: #fff;
      pointer-events: none;
      transition: opacity 220ms ease;
    }

    .training-card.is-active .training-card-collapsed-content {
      visibility: hidden;
      opacity: 0;
      transition: opacity 220ms ease, visibility 0s linear 220ms;
    }

    .training-card-active-content {
      position: relative;
      z-index: 20;
      display: flex;
      min-height: 0;
      flex: 0 0 0%;
      flex-direction: column;
      overflow: hidden;
      padding: 0 16px;
      background: #fff;
      opacity: 0;
      visibility: hidden;
      transition:
        flex-grow 700ms cubic-bezier(.4, 0, .2, 1),
        padding 700ms cubic-bezier(.4, 0, .2, 1),
        opacity 240ms ease,
        visibility 0s linear 240ms;
    }

    .training-card.is-active .training-card-active-content {
      flex: 1 1 0%;
      padding: 14px 16px 16px;
      opacity: 1;
      visibility: visible;
      transition:
        flex-grow 700ms cubic-bezier(.4, 0, .2, 1),
        padding 700ms cubic-bezier(.4, 0, .2, 1),
        opacity 240ms ease 100ms,
        visibility 0s;
    }

    .training-card-close {
      position: absolute;
      z-index: 30;
      top: 10px;
      right: 10px;
      display: grid;
      width: 28px;
      height: 28px;
      place-items: center;
      border-radius: 999px;
      background: rgb(255 255 255 / 85%);
      color: #102544;
      opacity: 0;
      visibility: hidden;
      transition: background-color 180ms ease, opacity 180ms ease, visibility 0s linear 180ms;
    }

    .training-card.is-active .training-card-close {
      opacity: 1;
      visibility: visible;
      transition: background-color 180ms ease, opacity 180ms ease 100ms, visibility 0s;
    }

    .training-card-close:hover {
      background: #fff;
    }

    .training-gallery-arrow {
      position: absolute;
      z-index: 5;
      top: 50%;
      display: grid;
      width: 42px;
      height: 42px;
      place-items: center;
      transform: translateY(-50%);
      border: 1px solid #c6d0dc;
      border-radius: 999px;
      background: #fff;
      color: #516984;
      transition:
        border-color 180ms ease,
        background-color 180ms ease,
        color 180ms ease;
    }

    .training-gallery-arrow:hover {
      border-color: #102544;
      background: #102544;
      color: #fff;
    }

    .training-gallery-arrow:focus-visible,
    .training-gallery-page:focus-visible,
    .training-card-close:focus-visible {
      outline: 2px solid #d6a62b;
      outline-offset: 3px;
    }

    .training-gallery-page {
      width: 34px;
      height: 4px;
      border-radius: 999px;
      background: #d3d6d8;
      transition:
        width 250ms ease,
        background-color 250ms ease;
    }

    .training-gallery-page.is-active {
      width: 44px;
      background: #d2a32b;
    }

    @media (min-width: 640px) and (max-width: 1023px) {
      .training-card {
        flex-basis: 48vw;
        height: 400px;
      }

      .training-card.is-active {
        height: 450px;
      }
    }

    @media (min-width: 1024px) and (max-width: 1679px) {
      .training-gallery-track {
        gap: 14px;
        padding-inline: 2px;
      }

      .training-card {
        flex-basis: 29vw;
        height: 370px;
      }

      .training-card.is-active {
        height: 430px;
      }
    }

    @media (min-width: 1680px) {
      .training-gallery-track {
        overflow: visible;
        min-height: 496px;
        padding: 34px 56px 42px;
        gap: 16px;
        scroll-snap-type: none;
      }

      .training-card {
        flex: 1 1 0%;
        height: 330px;
        border-radius: 13px;
      }

      .training-card.is-active {
        flex: 1.38 1 0%;
        height: 420px;
        border-radius: 15px;
      }

      .training-card-active-content {
        padding: 14px 18px 16px;
      }

      .training-gallery-arrow--previous {
        left: 0;
      }

      .training-gallery-arrow--next {
        right: 0;
      }
    }

    @media (max-width: 1679px) {
      .training-gallery-arrow {
        display: none;
      }
    }

    @media (max-width: 639px) {
      .training-card-active-content {
        padding: 14px 15px 15px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .training-card,
      .training-card-image,
      .training-card-image-wrap,
      .training-card-shade,
      .training-card-active-content,
      .training-card-collapsed-content,
      .training-gallery-arrow,
      .training-gallery-page,
      .training-card-close {
        scroll-behavior: auto !important;
        transition-duration: 0.01ms !important;
        transition-delay: 0ms !important;
      }
    }
  `}</style>
);

export default function Training() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activePage, setActivePage] = useState(0);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);

  const selectCourse = (index: number, bringIntoView = false) => {
    setActiveIndex(index);

    if (bringIntoView && window.matchMedia("(max-width: 1679px)").matches) {
      requestAnimationFrame(() => {
        cardRefs.current[index]?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
          block: "nearest",
          inline: "center",
        });
      });
    }
  };

  const moveActiveCourse = (direction: -1 | 1) => {
    const currentIndex = activeIndex ?? (direction === 1 ? -1 : 0);
    const nextIndex = (currentIndex + direction + courses.length) % courses.length;
    selectCourse(nextIndex, true);
    setActivePage(Math.max(0, Math.min(2, nextIndex - 2)));
  };

  return (
    <section
      id="training"
      className="training-bg relative overflow-hidden px-6 pt-16 pb-20 text-[#102544] sm:px-10 lg:px-[6.05%] lg:pt-20 lg:pb-24"
    >
      <Styles />

      <div className="mx-auto max-w-[1400px]">
        <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(330px,0.88fr)] lg:gap-8">
          <div className="relative z-10">
            <h2 className="training-serif max-w-[700px] text-[42px] leading-[1.04] tracking-[-0.025em] text-[#172440] sm:text-5xl lg:text-[64px]">
              Building Safer
              <br />
              Maritime Practices
            </h2>

            <p className="mt-7 max-w-[450px] text-[13px] leading-[1.75] tracking-[0.005em] text-[#526988] sm:text-sm">
              Practical, industry-focused training programmes for ship and
              shore personnel, supporting compliance, safety and sustainable
              operations across the maritime sector.
            </p>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="flex w-full max-w-[350px] flex-col">
              <p className="mb-7 flex items-center justify-center gap-3.5 text-[10px] font-medium tracking-[0.34em] text-[#263b60]/75">
                <span className="h-px w-10 bg-[#263b60]/60" />
                COURSES &amp; TRAINING
                <span className="h-px w-10 bg-[#263b60]/60" />
              </p>

              <div className="flex w-full items-start justify-between">
                {benefits.map(({ icon: Icon, first, second }, index) => (
                  <div
                    key={first}
                    className={`flex min-w-0 flex-1 flex-col items-center px-2 text-center ${
                      index !== 0 ? "border-l border-[#263b60]/10" : ""
                    }`}
                  >
                    <Icon
                      size={25}
                      strokeWidth={1.25}
                      className="mb-3 text-[#263b60]/85"
                      aria-hidden="true"
                    />
                    <span className="text-[11px] leading-[1.45] text-[#405779] sm:text-[12px]">
                      {first}
                      <br />
                      {second}
                    </span>
                  </div>
                ))}
              </div>

              <a
                href="#courses"
                className="group mt-8 inline-flex self-center items-center gap-3 rounded-md bg-[#102544] px-5 py-3 text-[12px] font-medium text-white transition-colors duration-300 hover:bg-[#203b60] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#d6a62b]"
              >
                View All Courses
                <ArrowRight
                  size={15}
                  strokeWidth={1.5}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </a>
            </div>
          </div>
        </div>

        <div className="relative mx-auto mt-8 max-w-[1560px] lg:relative lg:left-1/2 lg:mt-2 lg:w-[calc(100vw-12.1vw)] lg:-translate-x-1/2">
          <button
            type="button"
            aria-label="Show previous course"
            className="training-gallery-arrow training-gallery-arrow--previous"
            onClick={() => moveActiveCourse(-1)}
          >
            <ArrowLeft size={17} strokeWidth={1.5} />
          </button>

          <div className="training-gallery-track" id="courses">
            {courses.map((course, index) => {
              const expanded = activeIndex === index;

              return (
                <article
                  key={course.slug}
                  id={`course-${course.slug}`}
                  ref={(element) => {
                    cardRefs.current[index] = element;
                  }}
                  onMouseEnter={() => selectCourse(index)}
                  onMouseLeave={() => {
                    setActiveIndex((currentIndex) =>
                      currentIndex === index ? null : currentIndex,
                    );
                  }}
                  className={`training-card ${expanded ? "is-active" : ""}`}
                >
                  <button
                    type="button"
                    aria-label={`Show details for ${course.title.replace(/\n/g, " ")}`}
                    aria-pressed={expanded}
                    onFocus={() => selectCourse(index)}
                    onClick={() => selectCourse(index, true)}
                    className="training-card-select"
                  />

                  <div
                    className={`training-card-image-wrap ${expanded ? "is-expanded" : ""}`}
                  >
                    <img
                      src={`${import.meta.env.BASE_URL}${course.image}`}
                      alt={course.imageAlt}
                      loading={index < 3 ? "eager" : "lazy"}
                      className="training-card-image"
                    />

                    <div className="training-card-shade" />
                    <div className="training-card-collapsed-content">
                      <h3 className="training-serif whitespace-pre-line text-[21px] leading-[1.05] tracking-[-0.015em] text-white sm:text-[22px]">
                        {course.title}
                      </h3>
                      <span className="mt-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/85 text-white">
                        <ArrowRight size={14} strokeWidth={1.5} />
                      </span>
                    </div>

                    <button
                      type="button"
                      aria-label="Collapse course details"
                      className="training-card-close"
                      onClick={() => setActiveIndex(null)}
                      tabIndex={expanded ? 0 : -1}
                    >
                      <X size={16} strokeWidth={1.5} />
                    </button>
                  </div>

                  <div className="training-card-active-content">
                    <h3 className="training-serif whitespace-pre-line text-[20px] leading-[1.05] tracking-[-0.015em] text-[#102544] sm:text-[21px]">
                      {course.title}
                    </h3>
                    <p className="mt-2.5 line-clamp-4 text-[12px] leading-[1.5] text-[#60728b] sm:text-[12.5px]">
                      {course.description}
                    </p>
                    <Link
                      to={`/contact?subject=${encodeURIComponent(course.title.replace(/\n/g, " "))}` as any}
                      tabIndex={expanded ? 0 : -1}
                      aria-hidden={!expanded}
                      className="relative z-20 mt-auto inline-flex min-h-9 w-fit items-center gap-2 rounded-md bg-[#102544] px-4 py-2 text-[11px] font-medium text-white transition-colors hover:bg-[#203b60] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d6a62b]"
                    >
                      Ask about this course
                      <ArrowRight size={14} strokeWidth={1.5} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <button
            type="button"
            aria-label="Show next course"
            className="training-gallery-arrow training-gallery-arrow--next"
            onClick={() => moveActiveCourse(1)}
          >
            <ArrowRight size={17} strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-1 flex items-center justify-center gap-4" aria-label="Course groups">
          {[0, 1, 2].map((page) => (
            <button
              key={page}
              type="button"
              aria-label={`Show course group ${page + 1}`}
              aria-pressed={activePage === page}
              className={`training-gallery-page ${activePage === page ? "is-active" : ""}`}
              onClick={() => {
                selectCourse(page + 2, true);
                setActivePage(page);
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
