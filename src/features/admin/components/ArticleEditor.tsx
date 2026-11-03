import { useNavigate } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import {
  slugify,
  useSaveArticle
} from "@/features/admin/lib/articles";
import { imagesApi } from "@/lib/api";
import { type AdminArticle } from "@/features/admin/types";
import {
  useArticleCategories,
  useAddCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCategoryList,
  type CategoryItem,
} from "@/features/admin/lib/categories";
import { bodyToText, textToBody } from "./editor/parseBody";
import { useAuth } from "@/features/auth/lib/AuthContext";
import { AlertCircle, Pencil, Trash2 } from "lucide-react";
import { PdfUploader } from "./PdfUploader";

interface Props {
  initial?: AdminArticle;
  mode: "new" | "edit";
}

export function ArticleEditor({ initial, mode }: Props) {
  const navigate = useNavigate();
  const { data: articleCategories = [] } = useArticleCategories();
  const saveMutation = useSaveArticle();
  const addCategoryMutation = useAddCategory();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  // Initialize without depending on async-loaded `articleCategories`.
  // We'll pick a sensible default once the categories finish loading.
  const [category, setCategory] = useState<string>(() => initial?.category ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [content, setContent] = useState(() =>
    initial ? bodyToText(initial.body) : "",
  );
  const { user } = useAuth();
  const [author, setAuthor] = useState(
    initial?.author ?? user?.name ?? "SOS India Editorial",
  );
  const [newCat, setNewCat] = useState("");
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const { data: categoryItems = [] } = useCategoryList("articles");
  // When categories load, ensure we have a valid selected category.
  useEffect(() => {
    // If editing an existing article, preserve the initial category.
    if (initial?.category) return;
    if (!articleCategories || articleCategories.length === 0) return;
    // If no category selected yet, or the selected category isn't in the
    // fetched list, select the first available category.
    if (!category || !articleCategories.includes(category)) {
      setCategory(articleCategories[0]);
    }
  }, [articleCategories, initial?.category, category]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [contentType, setContentType] = useState<"cms" | "pdf">(
    (initial?.content_source as "cms" | "pdf") ?? "cms"
  );
  const [pdfUrl, setPdfUrl] = useState(initial?.pdf_file_path ?? "");

  const handleAddCategory = () => {
    const trimmed = newCat.trim();
    if (!trimmed) return;
    addCategoryMutation.mutate(
      { name: trimmed, type: "articles" },
      {
        onSuccess: (data: any, variables: any) => {
          // Prefer server-returned name, fallback to the requested name.
          const newName = (data && (data.name || data?.data?.name)) || variables?.name || trimmed;
          setCategory(newName);
          setNewCat("");
        },
        onError: () => {
          setNewCat("");
        }
      }
    );
  };

  const onUpload = async (file: File) => {
    setSaveError(null);
    setUploadingImage(true);
    try {
      const res = await imagesApi.upload(file, initial?.id);
      setCoverImage(res.url);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingImage(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSubmit = async (action: "draft" | "submitted") => {
    setSaveError(null);

    if (!title.trim()) {
      setSaveError("Please add a title before saving.");
      return;
    }
    if (!category.trim()) {
      setSaveError("Please select or add a category.");
      return;
    }
    if (contentType === "cms" && !content.trim()) {
      setSaveError("Body content is required for CMS newsletters.");
      return;
    }
    if (contentType === "pdf" && !pdfUrl) {
      setSaveError("Please upload a PDF file for the PDF newsletter.");
      return;
    }
    if (uploadingImage) {
      setSaveError("Please wait for the image upload to finish.");
      return;
    }
    if (coverImage.startsWith("data:")) {
      setSaveError("Image upload did not complete. Please upload the image again.");
      return;
    }

    const slug = initial?.slug ?? slugify(title);
    const now = new Date().toISOString();
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const reading = Math.max(1, Math.round(wordCount / 220));

    const article: AdminArticle = {
      id: initial?.id,
      slug,
      title: title.trim(),
      excerpt: excerpt.trim(),
      category,
      coverImage:
        coverImage ||
        "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=1600&q=80",
      author: author.trim() || "SOS India Editorial",
      author_id: initial?.author_id ?? (user?.id ? Number(user.id) : undefined),
      readingTime: reading,
      publishedAt: initial?.publishedAt ?? now,
      body: textToBody(content),
      status: action,
      updatedAt: now,
      content_source: contentType,
      pdf_file_path: contentType === "pdf" ? pdfUrl : null,
      ...(action === "submitted" ? { submitted_at: now } : {}),
    };

    try {
      await saveMutation.mutateAsync(article);
      if (action === "draft") {
        alert("Draft saved successfully.");
      } else {
        alert("Article submitted for review!");
        navigate({ to: "/admin/content" });
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save article");
    }
  };

  const latestRejectionNote = initial?.status === "rejected" 
    ? initial?.review_history?.find(h => h.decision === "rejected")?.notes 
    : null;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {mode === "new" ? "New article" : "Edit article"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Write your newsletter or insight, then submit it for review.
          </p>
        </div>
        <div className="flex gap-2 sm:shrink-0">
          <button
            type="button"
            disabled={saveMutation.isPending}
            onClick={() => handleSubmit("draft")}
            className="h-10 w-full rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 sm:w-auto"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={saveMutation.isPending}
            onClick={() => handleSubmit("submitted")}
            className="h-10 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 sm:w-auto"
          >
            Submit For Review
          </button>
        </div>
      </div>

      {saveError && (
        <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {saveError}
        </div>
      )}

      {initial?.status === "rejected" && latestRejectionNote && (
        <div className="mt-6 rounded-md border border-destructive/50 bg-destructive/10 p-4 flex gap-3 items-start">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-destructive">Submission Rejected</h3>
            <p className="mt-1 text-sm text-destructive/90">{latestRejectionNote}</p>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 sm:mt-8 lg:grid-cols-[1fr_320px] lg:gap-8">
        <div className="space-y-6">
          <Field label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title"
              className="h-12 w-full rounded-md border border-input bg-background px-4 text-lg font-medium outline-none focus:border-primary"
            />
          </Field>

          <Field label="Short summary (excerpt)">
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="One or two sentences that introduce the article."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </Field>

          {contentType === "cms" && (
            <Field
              label="Article content"
              hint="Supports Markdown: headings (#), bold (**text**), lists (-, 1.), quotes (>), tables (|), and dividers (---)."
            >
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                placeholder="Write your article…"
                className="min-h-[320px] w-full rounded-md border border-input bg-background px-4 py-3 font-serif text-[15px] leading-[1.7] outline-none focus:border-primary sm:min-h-[480px]"
              />
            </Field>
          )}
        </div>

        <aside className="space-y-6">
          <Field label="Content Type">
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as "cms" | "pdf")}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
            >
              <option value="cms">CMS Newsletter</option>
              <option value="pdf">PDF Newsletter</option>
            </select>
          </Field>

          <Field label="Featured image">
            <div className="rounded-md border border-border bg-background p-3">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt=""
                  className="aspect-[16/9] w-full rounded object-cover"
                />
              ) : (
                <div className="flex aspect-[16/9] items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                  No image
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUpload(f);
                }}
              />
              <button
                type="button"
                disabled={uploadingImage}
                onClick={() => fileRef.current?.click()}
                className="mt-3 h-9 w-full rounded-md border border-input bg-background text-xs font-medium text-foreground hover:bg-accent disabled:opacity-50"
              >
                {uploadingImage ? "Uploading…" : "Upload image"}
              </button>
            </div>
          </Field>

          {contentType === "pdf" && (
            <Field label="PDF Document">
              <PdfUploader
                pdfUrl={pdfUrl}
                onUploadSuccess={(url) => setPdfUrl(url)}
                onUploadError={(err) => setSaveError(err)}
              />
            </Field>
          )}

          <Field label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
            >
              {articleCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className="mt-2 flex gap-1.5">
              <input
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                placeholder="New category…"
                className="h-8 flex-1 rounded-md border border-input bg-background px-2.5 text-xs outline-none focus:border-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="h-8 shrink-0 rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
              >
                Add
              </button>
            </div>
            {category && (() => {
              const selectedCat = categoryItems.find(c => c.name === category);
              if (!selectedCat) return null;
              return (
                <div className="mt-2 flex gap-1.5" key={selectedCat.id}>
                  <button
                    type="button"
                    onClick={() => { setRenameValue(selectedCat.name); setRenameOpen(true); }}
                    className="flex h-7 flex-1 items-center justify-center gap-1 rounded-md border border-input bg-background px-2 text-xs text-foreground hover:bg-accent transition-colors"
                  >
                    <Pencil className="h-3 w-3" /> Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteOpen(true)}
                    className="flex h-7 flex-1 items-center justify-center gap-1 rounded-md border border-destructive/30 bg-background px-2 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              );
            })()}

            {/* Rename modal */}
            {renameOpen && (() => {
              const selectedCat = categoryItems.find(c => c.name === category);
              return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setRenameOpen(false); setRenameValue(""); }}>
                  <div className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg" onClick={e => e.stopPropagation()}>
                    <h3 className="text-sm font-semibold">Rename Category</h3>
                    <p className="mt-1 text-xs text-muted-foreground">Enter a new name for this category.</p>
                    <input
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      className="mt-3 h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === "Enter" && selectedCat) { updateCategory.mutate({ id: selectedCat.id, name: renameValue.trim(), type: "articles" }, { onSuccess: () => { setCategory(renameValue.trim()); setRenameOpen(false); setRenameValue(""); }, onError: (err: any) => { setSaveError(err.message); setRenameOpen(false); } }); } }}
                    />
                    <div className="mt-4 flex justify-end gap-2">
                      <button onClick={() => { setRenameOpen(false); setRenameValue(""); }} className="h-8 rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent transition-colors">Cancel</button>
                      <button onClick={() => { if (selectedCat) { updateCategory.mutate({ id: selectedCat.id, name: renameValue.trim(), type: "articles" }, { onSuccess: () => { setCategory(renameValue.trim()); setRenameOpen(false); setRenameValue(""); }, onError: (err: any) => { setSaveError(err.message); setRenameOpen(false); } }); } }} disabled={updateCategory.isPending} className="h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
                        {updateCategory.isPending ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Delete confirmation modal */}
            {deleteOpen && (() => {
              const selectedCat = categoryItems.find(c => c.name === category);
              return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteOpen(false)}>
                  <div className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg" onClick={e => e.stopPropagation()}>
                    <h3 className="text-sm font-semibold">Delete Category</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Are you sure you want to delete <strong>{selectedCat?.name}</strong>? This cannot be undone.
                    </p>
                    <div className="mt-4 flex justify-end gap-2">
                      <button onClick={() => setDeleteOpen(false)} className="h-8 rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent transition-colors">Cancel</button>
                      <button onClick={() => { if (selectedCat) { deleteCategory.mutate(selectedCat.id, { onSuccess: () => { setDeleteOpen(false); if (category === selectedCat.name) { setCategory(articleCategories[0] || ""); } }, onError: (err: any) => { setSaveError(err.message); setDeleteOpen(false); } }); } }} disabled={deleteCategory.isPending} className="h-8 rounded-md bg-destructive px-3 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 transition-colors">
                        {deleteCategory.isPending ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </Field>

          <Field label="Author">
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </Field>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
