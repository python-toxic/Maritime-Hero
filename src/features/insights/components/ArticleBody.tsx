import type { Block } from "@/features/insights";

export function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="mx-auto max-w-[68ch] space-y-6 text-base leading-[1.75] text-foreground/90 sm:text-[17px] sm:leading-[1.8]">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h1":
            return (
              <h1
                key={i}
                className="mt-12 scroll-mt-24 text-3xl font-bold tracking-tight text-foreground"
              >
                {block.text}
              </h1>
            );
          case "h2":
            return (
              <h2
                key={i}
                className="mt-10 scroll-mt-24 text-2xl font-semibold tracking-tight text-foreground"
              >
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3
                key={i}
                className="mt-8 text-xl font-semibold tracking-tight text-foreground"
              >
                {block.text}
              </h3>
            );
          case "h4":
            return (
              <h4
                key={i}
                className="mt-6 text-lg font-medium text-foreground"
              >
                {block.text}
              </h4>
            );
          case "h5":
            return (
              <h5
                key={i}
                className="mt-4 text-base font-medium text-foreground"
              >
                {block.text}
              </h5>
            );
          case "h6":
            return (
              <h6
                key={i}
                className="mt-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {block.text}
              </h6>
            );
          case "p":
            return (
              <p key={i} className="text-foreground/85">
                {block.text}
              </p>
            );
          case "ul":
            return (
              <ul
                key={i}
                className="ml-5 list-disc space-y-2 text-foreground/85 marker:text-primary"
              >
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="border-l-4 border-primary bg-accent/40 px-5 py-4 text-lg italic text-foreground/90"
              >
                {block.text}
              </blockquote>
            );
          case "hr":
            return (
              <hr key={i} className="my-8 border-t border-border/80" />
            );
          case "table":
            return (
              <div key={i} className="my-6 overflow-x-auto rounded-lg border border-border shadow-sm">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 font-semibold text-foreground">
                      {block.headers.map((header, j) => (
                        <th key={j} className="px-4 py-3 font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {block.rows.map((row, j) => (
                      <tr key={j} className="hover:bg-muted/20 transition-colors">
                        {row.map((cell, k) => (
                          <td key={k} className="px-4 py-3 text-foreground/80">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
}
