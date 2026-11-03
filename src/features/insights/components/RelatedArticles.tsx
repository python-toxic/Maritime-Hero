import { ArticleCard } from "./ArticleCard";
import { useRelatedArticles } from "@/features/insights/lib/queries";

export function RelatedArticles({ slug }: { slug: string }) {
  const { data: related = [], isLoading } = useRelatedArticles(slug, 3);
  if (isLoading || related.length === 0) return null;
  return (
    <section className="mx-auto mt-16 max-w-6xl">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        Related insights
      </h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </section>
  );
}
