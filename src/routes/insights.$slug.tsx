import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Clock, Linkedin, Facebook, Instagram } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { articlesApi, faqsApi } from "@/lib/api";
import { type Article } from "@/features/insights/types";
import { parseArticleBody, bodyToText } from "@/features/admin/components/editor/parseBody";
import { PdfViewer } from "@/features/insights/components/PdfViewer";
import { ArticleBody } from "@/features/insights/components/ArticleBody";

function mapArticleResponse(a: any): Article & { status?: string } {
  const body = parseArticleBody(a.body);
  return {
    ...a,
    category: a.category_name || a.category || "General",
    author: a.author || "SOS India Editorial",
    publishedAt: a.published_at || a.created_at,
    coverImage: a.featured_image_url || a.coverImage || "",
    body,
    readingTime:
      a.readingTime ||
      Math.max(1, Math.ceil(JSON.stringify(body).length / 1000)) ||
      5,
    content_source: a.content_source || "cms",
    pdf_file_path: a.pdf_file_path || null,
    status: a.status,
  };
}

export const Route = createFileRoute("/insights/$slug")({
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") setUrl(window.location.href);
  }, []);

  const { data: article, isLoading } = useQuery({
    queryKey: ["insights", "article", slug],
    queryFn: async () => {
      const res = await articlesApi.getBySlug(slug);
      if (res.success && res.data) {
        return mapArticleResponse(res.data);
      }
      return null;
    },
  });

  const { data: relatedFaqs = [] } = useQuery({
    queryKey: ["faqs", "related", article?.category],
    queryFn: async () => {
      if (!article?.category) return [];
      const res = await faqsApi.list(1, 4, article.category, "published");
      if (res.success && Array.isArray(res.data)) {
        return res.data;
      }
      return [];
    },
    enabled: !!article?.category,
  });

  const { data: relatedArticles = [] } = useQuery({
    queryKey: ["insights", "related", article?.category],
    queryFn: async () => {
      if (!article?.category) return [];
      const res = await articlesApi.list(1, 4, article.category, "published");
      if (res.success && Array.isArray(res.data)) {
        return res.data.map(mapArticleResponse);
      }
      return [];
    },
    enabled: !!article?.category,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Ensure visibility protection
  if (!article || article.status !== "published") {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Article not found
        </h1>
        <p className="mt-3 text-muted-foreground">
          The insight you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/insights"
          className="mt-6 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Browse all insights
        </Link>
      </div>
    );
  }



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="px-4 py-8 sm:px-6 md:px-8 md:py-14">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/insights"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Insights
        </Link>
      </div>

      <article className="mx-auto mt-6 max-w-6xl sm:mt-8">
        <header className="mx-auto max-w-[68ch]">
          <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-primary">
            {article.category}
          </span>
          <h1 className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl md:text-4xl">
            {article.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {article.excerpt}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{article.author}</span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <time dateTime={article.publishedAt}>
                {formatDate(article.publishedAt)}
              </time>
            </span>
            {article.content_source === "cms" && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {article.readingTime} min read
              </span>
            )}
          </div>
        </header>

        {article.content_source === "pdf" && article.pdf_file_path ? (
          <div className="mx-auto mt-12 max-w-4xl">
            <PdfViewer url={article.pdf_file_path} />
          </div>
        ) : (
          <>
            <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-lg border border-border">
              <img
                src={article.coverImage}
                alt={article.title}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>

            <div className="mx-auto mt-12 max-w-4xl">
              <ArticleBody blocks={article.body} />
            </div>

          </>
        )}

        <div className="mx-auto mt-12 max-w-4xl border-t border-border pt-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-foreground">Share this article:</span>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </a>
            <a
              href={`https://www.instagram.com/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <Instagram className="h-4 w-4" />
              Instagram
            </a>
          </div>
        </div>

        {relatedFaqs.length > 0 && (
          <section className="mx-auto mt-16 max-w-4xl border-t border-border pt-12">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Quick insights and support queries related to {article.category.toLowerCase()}.
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {relatedFaqs.map((faq: any) => (
                <div
                  key={faq.id}
                  className="flex flex-col justify-between rounded-lg border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div>
                    <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-primary">
                      {faq.category}
                    </span>
                    <h3 className="mt-3 text-sm font-semibold text-foreground leading-snug">
                      {faq.question}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border">
                    <Link
                      to="/faq"
                      hash={`faq-${faq.id}`}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      View full answer →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {relatedArticles.filter((a) => a.slug !== slug).length > 0 && (
          <section className="mx-auto mt-16 max-w-4xl border-t border-border pt-12">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              More insights
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {relatedArticles
                .filter((a) => a.slug !== slug)
                .slice(0, 2)
                .map((a) => (
                  <Link
                    key={a.slug}
                    to="/insights/$slug"
                    params={{ slug: a.slug }}
                    className="group rounded-lg border border-border bg-card p-4 hover:border-primary/50 hover:shadow-md transition-all"
                  >
                    <div className="text-xs font-medium text-primary">{a.category}</div>
                    <h3 className="mt-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {a.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                      {a.excerpt}
                    </p>
                  </Link>
                ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
