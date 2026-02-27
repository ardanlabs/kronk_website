import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { Navbar } from "@/components/Navbar";
import { Loader2 } from "lucide-react";
import { extractToc, stripTocFromContent, groupTocByChapter, type TocEntry } from "@/lib/manual";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MANUAL_API =
  "https://api.github.com/repos/ardanlabs/kronk/contents/.manual?ref=main";

/**
 * Fetches the manual from the kronk repo's .manual directory.
 * The manual was moved into separate chapter files - we discover all .md files,
 * fetch each one, and combine them into a single document in order.
 */
const fetchManual = async (): Promise<string> => {
  // 1. Get directory listing from GitHub API
  const dirRes = await fetch(MANUAL_API);
  if (!dirRes.ok) throw new Error("Failed to fetch manual directory");
  const entries = (await dirRes.json()) as Array<{ name: string; type: string; download_url: string | null }>;

  // 2. Filter for .md files and sort by name (preserves chapter order)
  const mdFiles = entries
    .filter((e) => e.type === "file" && e.name.endsWith(".md"))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (mdFiles.length === 0) throw new Error("No manual chapters found");

  // 3. Fetch each file and combine into single document
  const results = await Promise.all(
    mdFiles.map(async (file) => {
      const url = file.download_url ?? `https://raw.githubusercontent.com/ardanlabs/kronk/main/.manual/${file.name}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch ${file.name}`);
      return res.text();
    })
  );

  return results.join("\n\n");
};

const TocItem = ({ entry }: { entry: TocEntry }) => (
  <a
    href={`#${entry.id}`}
    className="block py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border-l-2 border-transparent hover:border-primary -ml-px"
    style={{ paddingLeft: `${(entry.depth - 1) * 12}px` }}
  >
    {entry.text}
  </a>
);

const TocChapterHeader = ({ entry }: { entry: TocEntry }) => (
  <a
    href={`#${entry.id}`}
    className="block py-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
  >
    {entry.text}
  </a>
);

const scrollToChapter = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const Manual = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["kronk-manual"],
    queryFn: fetchManual,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const toc = data ? extractToc(data) : [];
  const chapters = data ? groupTocByChapter(toc) : [];
  const content = data ? stripTocFromContent(data) : "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="w-full lg:container mx-auto px-6 pt-12 lg:pt-24 pb-16">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading manual...</p>
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 max-w-2xl">
            <h2 className="text-lg font-semibold text-destructive mb-2">
              Failed to load manual
            </h2>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
            <button
              onClick={() => refetch()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        )}

        {data && (
          <div className="flex flex-col lg:flex-row gap-12 w-full-viewport lg:w-full relative">
            {/* Mobile: Sticky chapter dropdown */}
            <div className="lg:hidden w-full-viewport lg:w-full order-first sticky top-16 z-20 -mx-6 px-6 py-3 bg-background/95 backdrop-blur-sm border-b border-border mb-4">
              <Select
                onValueChange={(value) => scrollToChapter(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Jump to chapter" />
                </SelectTrigger>
                <SelectContent>
                  {chapters.map((chapter) => (
                    <SelectItem
                      key={chapter.heading.id}
                      value={chapter.heading.id}
                    >
                      {chapter.heading.text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Left: Sticky TOC (desktop) */}
            <aside className="w-64 shrink-0 hidden lg:block border-r border-border pr-6">
              <nav className="sticky top-24">
                <h2 className="text-sm font-semibold text-foreground mb-4">
                  On this page
                </h2>
                <ScrollArea className="h-[calc(100vh-8rem)]">
                  <div className="space-y-4 pr-4">
                    {chapters.map((chapter) => (
                      <div key={chapter.heading.id}>
                        <div className="sticky top-0 z-10 bg-background py-2 -mt-2 pt-2 border-b border-border/50 mb-2">
                          <TocChapterHeader entry={chapter.heading} />
                        </div>
                        <div className="space-y-1">
                          {chapter.children.map((entry) => (
                            <TocItem key={entry.id} entry={entry} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </nav>
            </aside>

            {/* Right: Content */}
            <article className="min-w-0 flex-1 order-last lg:order-none prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-32 lg:prose-headings:scroll-mt-24 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:text-slate-800 prose-pre:[&>code]:text-slate-800 dark:prose-pre:text-slate-200 dark:prose-pre:[&>code]:text-slate-200 prose-code:text-slate-800 dark:prose-code:text-slate-200 prose-img:rounded-lg">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
                components={{
                  a: ({ href, children, ...props }) => {
                    const isExternal = href?.startsWith("http");
                    return (
                      <a
                        href={href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        {...props}
                      >
                        {children}
                      </a>
                    );
                  },
                  table: ({ children, ...props }) => (
                    <div className="overflow-x-auto">
                      <table {...props}>{children}</table>
                    </div>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </article>
          </div>
        )}
      </main>
    </div>
  );
};

export default Manual;
