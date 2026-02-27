import GithubSlugger from "github-slugger";

export interface TocEntry {
  id: string;
  text: string;
  depth: number;
}

/**
 * Extract headings from markdown and build a table of contents.
 * Uses github-slugger to match rehype-slug's ID generation.
 * Skips lines inside fenced code blocks (```) so shell comments like
 * "# 1. Install Kronk" are not mistaken for headings.
 */
export function extractToc(markdown: string): TocEntry[] {
  const slugger = new GithubSlugger();
  const headings: TocEntry[] = [];
  const lines = markdown.split("\n");
  let inCodeBlock = false;
  let codeFence = "";

  for (const line of lines) {
    // Track fenced code blocks (``` or ```shell, etc.)
    const openFence = line.match(/^(`{3,})(\w*)/);
    if (openFence) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeFence = openFence[1];
      } else if (line.startsWith(codeFence)) {
        inCodeBlock = false;
      }
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const depth = match[1].length;
      const text = match[2].replace(/#+$/, "").trim();
      if (text.toLowerCase() === "table of contents") continue;
      const id = slugger.slug(text);
      headings.push({ id, text, depth });
    }
  }

  return headings;
}

/**
 * Remove the Table of Contents section from markdown so we can render
 * our own sidebar TOC instead. Strips from "## Table of Contents" through "---".
 */
export function stripTocFromContent(markdown: string): string {
  let result = markdown;
  let prev: string;
  do {
    prev = result;
    const tocStart = result.search(/\n## Table of Contents\n/i);
    if (tocStart === -1) break;

    const afterToc = result.slice(tocStart);
    const hrMatch = afterToc.match(/\n---\s*\n/);
    if (!hrMatch) break;

    const contentStart = tocStart + hrMatch.index! + hrMatch[0].length;
    const beforeToc = result.slice(0, tocStart).trimEnd();
    const afterHr = result.slice(contentStart).trimStart();

    result = beforeToc + "\n\n" + afterHr;
  } while (result !== prev);

  return result;
}
