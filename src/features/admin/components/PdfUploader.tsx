import { useRef, useState } from "react";
import { pdfsApi } from "@/lib/api";

interface Props {
  pdfUrl: string | null;
  onUploadSuccess: (url: string) => void;
  onUploadError: (err: string) => void;
}

export function PdfUploader({ pdfUrl, onUploadSuccess, onUploadError }: Props) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await pdfsApi.upload(file);
      onUploadSuccess(res.url);
    } catch (err) {
      onUploadError(err instanceof Error ? err.message : "Failed to upload PDF");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="rounded-md border border-border bg-background p-3">
      {pdfUrl ? (
        <div className="flex items-center gap-2 rounded bg-muted p-3 text-sm">
          <svg
            className="h-5 w-5 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-blue-600 hover:underline"
          >
            {pdfUrl.split("/").pop() || "View PDF"}
          </a>
        </div>
      ) : (
        <div className="flex aspect-[4/1] items-center justify-center rounded bg-muted text-xs text-muted-foreground">
          No PDF uploaded
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
        }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => fileRef.current?.click()}
        className="mt-3 h-9 w-full rounded-md border border-input bg-background text-xs font-medium text-foreground hover:bg-accent disabled:opacity-50"
      >
        {uploading ? "Uploading…" : "Upload PDF"}
      </button>
    </div>
  );
}
