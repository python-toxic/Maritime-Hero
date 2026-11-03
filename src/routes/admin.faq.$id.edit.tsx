import { createFileRoute, Link } from "@tanstack/react-router";
import { FaqEditor } from "@/features/admin/components/FaqEditor";
import { useFaq } from "@/features/faq/lib/queries";

export const Route = createFileRoute("/admin/faq/$id/edit")({
  head: () => ({ meta: [{ title: "Edit FAQ — SOS India Admin" }] }),
  component: EditFaq,
});

function EditFaq() {
  const { id } = Route.useParams();
  const { data: faq, isLoading } = useFaq(id);

  return (
    <>
      {isLoading ? null : !faq ? (
        <div className="rounded-lg border border-border bg-background p-8 text-center">
          <h2 className="text-base font-semibold text-foreground">
            FAQ not found
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            It may have been deleted.
          </p>
          <Link
            to="/admin/faq"
            className="mt-4 inline-flex h-9 items-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent"
          >
            Back to FAQ
          </Link>
        </div>
      ) : (
        <FaqEditor mode="edit" initial={faq} />
      )}
    </>
  );
}
