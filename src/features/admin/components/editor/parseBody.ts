import type { Block } from "@/features/insights";
import type { AdminArticle } from "../../types";

/** Parse API/DB body (JSON string or block array) into editor blocks. */
export function parseArticleBody(body: unknown): Block[] {
  if (Array.isArray(body)) {
    return body as Block[];
  }

  if (typeof body === "string") {
    const trimmed = body.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed as Block[];
      if (parsed && typeof parsed === "object") return [parsed as Block];
    } catch {
      return [{ type: "p", text: body }];
    }

    return [{ type: "p", text: body }];
  }

  return [];
}

/** Serialize structured blocks back to standard Markdown for the editor textarea. */
export function bodyToText(body: AdminArticle["body"] | string | unknown): string {
  const blocks = (Array.isArray(body) ? body : parseArticleBody(body)) as Block[];
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return typeof body === "string" ? body : "";
  }

  return blocks
    .map((b) => {
      if (b.type === "h1")    return `# ${b.text}`;
      if (b.type === "h2")    return `## ${b.text}`;
      if (b.type === "h3")    return `### ${b.text}`;
      if (b.type === "h4")    return `#### ${b.text}`;
      if (b.type === "h5")    return `##### ${b.text}`;
      if (b.type === "h6")    return `###### ${b.text}`;
      if (b.type === "ul")    return b.items.map((i: string) => `- ${i}`).join("\n");
      if (b.type === "quote") return `> ${b.text}`;
      if (b.type === "p")     return b.text;
      if (b.type === "hr")    return "---";
      if (b.type === "table") {
        const headerLine = `| ${b.headers.join(" | ")} |`;
        const dividerLine = `| ${b.headers.map(() => "---").join(" | ")} |`;
        const rowLines = b.rows.map((row: string[]) => `| ${row.join(" | ")} |`);
        return [headerLine, dividerLine, ...rowLines].join("\n");
      }
      return ""; // safe fallback for any future block variant
    })
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Strip common inline Markdown syntax from a string.
 *
 * ArticleBody.tsx has no inline renderer, so **bold**, *italic*, `code`,
 * and [text](url) markers must be removed before storing in the DB,
 * otherwise they display as raw punctuation in the published newsletter.
 */
function stripInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")    // **bold**  → bold
    .replace(/\*(.+?)\*/g,     "$1")    // *italic*  → italic
    .replace(/`(.+?)`/g,       "$1")    // `code`    → code
    .replace(/\[(.+?)\]\(.+?\)/g, "$1"); // [t](url)  → t
}

/**
 * Parse standard Markdown text into structured Block[] for the database.
 *
 * Uses a line-by-line state machine so mixed content (e.g. a paragraph
 * immediately followed by a list, with no blank line) is handled correctly.
 * All inline markdown (`**bold**`, `*italic*`, etc.) is stripped from text
 * values because ArticleBody.tsx has no inline renderer.
 *
 * Supported syntax:
 *   # Heading to ###### Heading → { type: "h1" | "h2" | ... | "h6", text: "..." }
 *   --- / *** / ___            → { type: "hr" }
 *   > Blockquote               → { type: "quote", text: "..." }
 *   - item / * item            → grouped into { type: "ul", items: [...] }
 *   1. item / 2. item          → grouped into { type: "ul", items: [...] }
 *   GitHub Table               → { type: "table", headers: [...], rows: [[...], ...] }
 *   plain text                 → { type: "p",     text: "..." }  (consecutive lines merged)
 *
 * Blocks are separated by blank lines OR by a type change.
 */
export function textToBody(text: string): AdminArticle["body"] {
  const blocks: AdminArticle["body"] = [];

  // Current accumulation state
  type State = "idle" | "paragraph" | "list" | "table";
  let state: State = "idle";
  let paragraphLines: string[] = [];
  let listItems: string[] = [];
  let currentTable: { type: "table"; headers: string[]; rows: string[][] } | null = null;

  /** Flush whatever is currently being accumulated into a block. */
  function flush() {
    if (state === "paragraph" && paragraphLines.length > 0) {
      blocks.push({ type: "p", text: paragraphLines.join("\n") });
      paragraphLines = [];
    } else if (state === "list" && listItems.length > 0) {
      blocks.push({ type: "ul", items: [...listItems] });
      listItems = [];
    } else if (state === "table" && currentTable) {
      blocks.push(currentTable);
      currentTable = null;
    }
    state = "idle";
  }

  // Helpers for table parsing
  function isTableDivider(trimmed: string): boolean {
    return /^[|\s-:]+$/.test(trimmed) && trimmed.includes("-") && trimmed.includes("|");
  }

  function parseTableRow(line: string): string[] {
    let cleaned = line.trim();
    if (cleaned.startsWith("|")) cleaned = cleaned.slice(1);
    if (cleaned.endsWith("|")) cleaned = cleaned.slice(0, -1);
    return cleaned.split("|").map(cell => stripInline(cell.trim()));
  }

  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    const trimmed = line.trim();

    // ── Blank line: separator between blocks ────────────────────────────────
    if (trimmed === "") {
      flush();
      continue;
    }

    // ── Horizontal Rule ─────────────────────────────────────────────────────
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      flush();
      blocks.push({ type: "hr" });
      continue;
    }

    // ── Table Divider ───────────────────────────────────────────────────────
    if (isTableDivider(trimmed) && state === "paragraph" && paragraphLines.length > 0) {
      const headerLine = paragraphLines.pop()!;
      if (paragraphLines.length > 0) {
        blocks.push({ type: "p", text: paragraphLines.join("\n") });
        paragraphLines = [];
      }
      const headers = parseTableRow(headerLine);
      state = "table";
      currentTable = { type: "table", headers, rows: [] };
      continue;
    }

    // ── Active Table Row ────────────────────────────────────────────────────
    if (state === "table") {
      if (trimmed.includes("|")) {
        currentTable!.rows.push(parseTableRow(line));
        continue;
      } else {
        flush();
        // Fall through to parse this line as a normal block
      }
    }

    // ── Heading: any number of leading # (# to ######) ──────────────────────
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      flush();
      const level = headingMatch[1].length;
      blocks.push({ type: `h${level}` as any, text: stripInline(headingMatch[2].trim()) });
      continue;
    }

    // ── Blockquote: > … (with or without trailing space) ───────────────────
    if (/^>\s?/.test(trimmed)) {
      flush();
      blocks.push({ type: "quote", text: stripInline(trimmed.replace(/^>\s?/, "").trim()) });
      continue;
    }

    // ── Unordered list item: - … or * … ────────────────────────────────────
    if (/^[-*]\s+/.test(trimmed)) {
      if (state === "paragraph") flush();
      state = "list";
      listItems.push(stripInline(trimmed.replace(/^[-*]\s+/, "")));
      continue;
    }

    // ── Ordered list item: 1. … / 2. … etc. ────────────────────────────────
    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)/);
    if (orderedMatch) {
      if (state === "paragraph") flush();
      state = "list";
      listItems.push(stripInline(orderedMatch[1]));
      continue;
    }

    // ── Plain text ──────────────────────────────────────────────────────────
    if (state === "list") flush();
    state = "paragraph";
    paragraphLines.push(stripInline(trimmed));
  }

  // Flush any remaining accumulation after the last line
  flush();

  return blocks;
}
