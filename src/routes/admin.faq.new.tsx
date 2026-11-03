import { createFileRoute } from "@tanstack/react-router";
import { FaqEditor } from "@/features/admin/components/FaqEditor";

export const Route = createFileRoute("/admin/faq/new")({
  head: () => ({ meta: [{ title: "New FAQ — SOS India Admin" }] }),
  component: NewFaq,
});

function NewFaq() {
  return (
    <FaqEditor mode="new" />
  );
}
