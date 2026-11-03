import { createFileRoute } from "@tanstack/react-router";
import Training from "@/features/home/Training";
import { PublicPage } from "@/features/public/PublicPage";

export const Route = createFileRoute("/training")({
  head: () => ({ meta: [{ title: "Training and Courses — SOS India" }, { name: "description", content: "Explore maritime safety and hazardous-material awareness training topics from SOS India." }] }),
  component: TrainingPage,
});

function TrainingPage() {
  return <PublicPage eyebrow="Training" title="Build practical maritime safety knowledge" intro="Training topics for ship, shore, and ship-recycling teams, including IHM awareness, hazardous materials, fire safety, and emergency response."><Training /></PublicPage>;
}
