import { Component, type ReactNode } from "react";
import { FileWarning } from "lucide-react";

interface PdfErrorBoundaryProps {
  url: string;
  children: ReactNode;
}

interface PdfErrorBoundaryState {
  hasError: boolean;
}

/**
 * Error boundary wrapping PDF.js rendering. On failure, shows a friendly
 * message with a download button so users can still access the PDF.
 */
export class PdfErrorBoundary extends Component<
  PdfErrorBoundaryProps,
  PdfErrorBoundaryState
> {
  constructor(props: PdfErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): PdfErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("PDF rendering error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-muted/30 px-6 py-12 text-center">
          <FileWarning className="h-10 w-10 text-muted-foreground/60" />
          <div>
            <h3 className="text-sm font-medium text-foreground">
              Unable to display this document
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              The PDF couldn&apos;t be rendered inline. You can download it
              instead.
            </p>
          </div>
          <a
            href={this.props.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none"
          >
            Download PDF
          </a>
        </div>
      );
    }

    return this.props.children;
  }
}
