import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { Navbar } from "@/components/Navbar";
import { Loader2 } from "lucide-react";
import { extractToc, stripTocFromContent, type TocEntry } from "@/lib/manual";
import { ScrollArea } from "@/components/ui/scroll-area";

const MANUAL_BASE =
  "https://raw.githubusercontent.com/ardanlabs/kronk/main/.manual";

const CHAPTERS = [
  "chapter-01-introduction.md",
  "chapter-02-installation.md",
  "chapter-03-model-configuration.md",
  "chapter-04-batch-processing.md",
  "chapter-05-message-caching.md",
  "chapter-06-yarn-extended-context.md",
  "chapter-07-model-server.md",
  "chapter-08-api-endpoints.md",
  "chapter-09-request-parameters.md",
  "chapter-10-multi-modal-models.md",
  "chapter-11-security-authentication.md",
  "chapter-12-browser-ui.md",
  "chapter-13-client-integration.md",
  "chapter-14-observability.md",
  "chapter-15-mcp-service.md",
  "chapter-16-troubleshooting.md",
  "chapter-17-developer-guide.md",
];

const fetchManual = async (): Promise<string> => {
  const results = await Promise.all(
    CHAPTERS.map(async (name) => {
      const res = await fetch(`${MANUAL_BASE}/${name}`);
      if (!res.ok) throw new Error(`Failed to fetch ${name}`);
      return res.text();
    })
  );
  return results.join("\n\n");
};

const TocItem = ({ entry }: { entry: TocEntry }) => (
  <a
    href={`#${entry.id}`}
    className="block py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border-l-2 border-transparent hover:border-primary -ml-px"
    style={{ paddingLeft: `${entry.depth * 12}px` }}
  >
    {entry.text}
  </a>
);

const Manual = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["kronk-manual"],
    queryFn: fetchManual,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const toc = data ? extractToc(data) : [];
  const content = data ? stripTocFromContent(data) : "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-16">
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
          <div className="flex gap-12">
            {/* Left: Sticky TOC */}
            <aside className="w-64 shrink-0 hidden lg:block border-r border-border pr-6">
              <nav className="sticky top-24">
                <h2 className="text-sm font-semibold text-foreground mb-4">
                  On this page
                </h2>
                <ScrollArea className="h-[calc(100vh-8rem)]">
                  <div className="space-y-1 pr-4">
                    {toc.map((entry) => (
                      <TocItem key={entry.id} entry={entry} />
                    ))}
                  </div>
                </ScrollArea>
              </nav>
            </aside>

            {/* Right: Content */}
            <article className="min-w-0 flex-1 prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:text-slate-800 prose-pre:[&>code]:text-slate-800 dark:prose-pre:text-slate-200 dark:prose-pre:[&>code]:text-slate-200 prose-code:text-slate-800 dark:prose-code:text-slate-200 prose-img:rounded-lg">
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
