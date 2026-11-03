import { createFileRoute } from "@tanstack/react-router";
import { ArticleEditor } from "@/features/admin/components/ArticleEditor";

export const Route = createFileRoute("/admin/articles/new")({
  head: () => ({ meta: [{ title: "New article — SOS India Admin" }] }),
  component: NewArticle,
});

function NewArticle() {
  return (
    <ArticleEditor mode="new" />
  );
}
