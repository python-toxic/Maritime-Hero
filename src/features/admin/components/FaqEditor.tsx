import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { type FAQ } from "@/features/faq";
import { useSaveFaq } from "@/features/faq/lib/queries";
import {
  useFaqCategories,
  useAddCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCategoryList,
} from "@/features/admin/lib/categories";
import { Loader2, Pencil, Trash2 } from "lucide-react";

interface Props {
  initial?: FAQ;
  mode: "new" | "edit";
}

export function FaqEditor({ initial, mode }: Props) {
  const navigate = useNavigate();
  const { data: faqCategories = [] } = useFaqCategories();
  const saveMutation = useSaveFaq();
  const addCategoryMutation = useAddCategory();

  const [question, setQuestion] = useState(initial?.question ?? "");
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [category, setCategory] = useState(initial?.category ?? "General");
  const [newCat, setNewCat] = useState("");
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const { data: categoryItems = [] } = useCategoryList("faqs");

  useEffect(() => {
    if (!category && faqCategories.length > 0) {
      setCategory(faqCategories[0]);
    }
  }, [faqCategories, category]);

  const handleAddCategory = () => {
    const trimmed = newCat.trim();
    if (!trimmed) return;

    addCategoryMutation.mutate(
      { name: trimmed, type: "faqs" },
      {
        onSuccess: () => {
          setCategory(trimmed);
          setNewCat("");
        },
        onError: () => setNewCat(""),
      }
    );
  };

  const handleSave = async (finalStatus: "draft" | "published") => {
    setError(null);

    if (!question.trim()) {
      setError("Please add a question before saving.");
      return;
    }

    if (!answer.trim()) {
      setError("Please add an answer before saving.");
      return;
    }

    const faq: FAQ = {
      id: mode === "edit" && initial?.id ? initial.id : "",
      question: question.trim(),
      answer: answer.trim(),
      category,
      status: finalStatus,
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveMutation.mutateAsync(faq);
      navigate({ to: "/admin/faq" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save FAQ");
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {mode === "new" ? "New FAQ" : "Edit FAQ"}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Publish or draft a frequently asked question.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:shrink-0">
          <button
            type="button"
            disabled={saveMutation.isPending}
            onClick={() => handleSave("draft")}
            className="h-10 w-full rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50 sm:w-auto"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={saveMutation.isPending}
            onClick={() => handleSave("published")}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 sm:w-auto"
          >
            {saveMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Publish FAQ
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-6 sm:mt-8 lg:grid-cols-[1fr_320px] lg:gap-8">
        <div className="space-y-6">
          <Field label="Question">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., What are the latest IMO regulations?"
              className="h-12 w-full rounded-md border border-input bg-background px-4 text-sm font-medium outline-none focus:border-primary transition-colors"
            />
          </Field>

          <Field label="Answer">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={12}
              placeholder="Provide a clear answer..."
              className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm leading-relaxed outline-none focus:border-primary transition-colors"
            />
          </Field>
        </div>

        <aside className="space-y-6">
          <Field label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary transition-colors"
            >
              {faqCategories.map((c) => (
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
                className="h-8 shrink-0 rounded-md border border-input bg-background px-2.5 text-xs font-medium hover:bg-accent transition-colors"
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
                    <p className="mt-1 text-xs text-muted-foreground">Enter a new name.</p>
                    <input
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      className="mt-3 h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === "Enter" && selectedCat) { updateCategory.mutate({ id: selectedCat.id, name: renameValue.trim(), type: "faqs" }, { onSuccess: () => { setCategory(renameValue.trim()); setRenameOpen(false); setRenameValue(""); }, onError: (err: any) => { setError(err.message); setRenameOpen(false); } }); } }}
                    />
                    <div className="mt-4 flex justify-end gap-2">
                      <button onClick={() => { setRenameOpen(false); setRenameValue(""); }} className="h-8 rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent transition-colors">Cancel</button>
                      <button onClick={() => { if (selectedCat) { updateCategory.mutate({ id: selectedCat.id, name: renameValue.trim(), type: "faqs" }, { onSuccess: () => { setCategory(renameValue.trim()); setRenameOpen(false); setRenameValue(""); }, onError: (err: any) => { setError(err.message); setRenameOpen(false); } }); } }} disabled={updateCategory.isPending} className="h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
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
                      Are you sure you want to delete <strong>{selectedCat?.name}</strong>?
                    </p>
                    <div className="mt-4 flex justify-end gap-2">
                      <button onClick={() => setDeleteOpen(false)} className="h-8 rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent transition-colors">Cancel</button>
                      <button onClick={() => { if (selectedCat) { deleteCategory.mutate(selectedCat.id, { onSuccess: () => { setDeleteOpen(false); if (category === selectedCat.name) { setCategory(faqCategories[0] || ""); } }, onError: (err: any) => { setError(err.message); setDeleteOpen(false); } }); } }} disabled={deleteCategory.isPending} className="h-8 rounded-md bg-destructive px-3 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 transition-colors">
                        {deleteCategory.isPending ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </Field>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
