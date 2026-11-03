import { createFileRoute } from "@tanstack/react-router";

import { HeroSection } from "../features/home/HeroSection";
import { ServicesSection } from "../features/home/ServicesSection";
import { AboutSection } from "../features/home/AboutUs";
import Training from "../features/home/Training";
import { NextStepsSection } from "../features/home/NextStepsSection";

function HomePage() {
  return (
    <main>
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <Training />
      <NextStepsSection />
    </main>
  );
}

export const Route = createFileRoute("/")({
  component: HomePage,
});
