import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useArticle, useReviewArticle } from "@/features/admin";
import { ArticleStatusBadge } from "@/features/admin/components/ArticleStatusBadge";
import { useAuth } from "@/features/auth/lib/AuthContext";
import { bodyToText } from "@/features/admin/components/editor/parseBody";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/reviews/$id")({
  head: () => ({ meta: [{ title: "Review Content — SOS India Admin" }] }),
  component: () => (
    <ProtectedRoute requiredPermission="canReviewContent">
      <ReviewDetail />
    </ProtectedRoute>
  ),
});

function ReviewDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: article, isLoading } = useArticle(id);
  const reviewMutation = useReviewArticle();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <p className="text-muted-foreground text-lg">Article not found.</p>
        <Link to="/admin/reviews" className="text-primary hover:underline">
          Return to Queue
        </Link>
      </div>
    );
  }

  const handleApprove = () => {
    if (confirm("Are you sure you want to approve this content?")) {
      reviewMutation.mutate(
        { id: article.id, action: "approved", managerId: Number(user?.id) },
        {
          onSuccess: () => {
            alert("Article approved successfully.");
            navigate({ to: "/admin/reviews" });
          },
        }
      );
    }
  };

  const handleReject = () => {
    if (confirm("Are you sure you want to reject this content?")) {
      reviewMutation.mutate(
        { id: article.id, action: "rejected", managerId: Number(user?.id) },
        {
          onSuccess: () => {
            alert("Article rejected.");
            navigate({ to: "/admin/reviews" });
          },
        }
      );
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/admin/reviews" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              ← Back to Queue
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium text-foreground">Review</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl mt-2">
            {article.title}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <ArticleStatusBadge status={article.status} />
            <span className="text-sm text-muted-foreground">in {article.category}</span>
          </div>
        </div>

        <div className="flex gap-2 sm:shrink-0 bg-background border border-border p-2 rounded-lg shadow-sm">
          <button
            onClick={handleReject}
            className="h-9 px-4 rounded-md border border-destructive/30 text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground focus:outline-none"
          >
            Reject Content
          </button>
          <button
            onClick={handleApprove}
            className="h-9 px-4 rounded-md bg-green-600 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:outline-none shadow-sm"
          >
            Approve Content
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* Main Content Read-Only View */}
        <div className="space-y-8 bg-background border border-border rounded-xl p-6 sm:p-8 shadow-sm">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Excerpt</h3>
            <p className="text-lg text-foreground leading-relaxed">
              {article.excerpt || <span className="italic text-muted-foreground">No excerpt provided.</span>}
            </p>
          </div>

          <div className="h-px bg-border w-full"></div>

          {article.content_source === "pdf" ? (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">PDF Document</h3>
              {article.pdf_file_path ? (
                <iframe
                  src={article.pdf_file_path}
                  className="w-full h-[600px] border border-border rounded-md"
                  title="PDF Preview"
                />
              ) : (
                <p className="text-muted-foreground italic">No PDF file attached.</p>
              )}
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Body Content</h3>
              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none font-serif leading-relaxed whitespace-pre-wrap">
                {bodyToText(article.body)}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Meta Read-Only View */}
        <aside className="space-y-6">
          <div className="bg-background border border-border rounded-xl p-5 shadow-sm space-y-4">
            {article.content_source !== "pdf" && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Featured Image</h3>
                {article.coverImage ? (
                  <img
                    src={article.coverImage}
                    alt="Featured"
                    className="aspect-[16/9] w-full rounded-md object-cover border border-border"
                  />
                ) : (
                  <div className="flex aspect-[16/9] items-center justify-center rounded-md bg-muted text-xs text-muted-foreground border border-border">
                    No image provided
                  </div>
                )}
              </div>
            )}

            <div className={`pt-2 ${article.content_source !== "pdf" ? "border-t border-border" : ""}`}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Author Name</h3>
              <p className="text-sm text-foreground">{article.author}</p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
