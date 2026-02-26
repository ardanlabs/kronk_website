import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { Navbar } from "@/components/Navbar";
import { getPostBySlug, formatDate, getAuthor } from "@/lib/blog";
import { Calendar, ArrowLeft, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => getPostBySlug(slug!),
    enabled: !!slug,
    retry: 2,
  });

  if (!slug) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 pt-24 pb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Post not found</h1>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to blog
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 pt-24 pb-16">
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading post...</p>
          </div>
        </main>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-6 pt-24 pb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Post not found</h1>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to blog
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const author = getAuthor(post.author);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to blog
          </Link>

          {post.banner && (
            <div className="mb-10 -mx-6 sm:mx-0 sm:rounded-xl overflow-hidden">
              <img
                src={encodeURI(post.banner)}
                alt=""
                className="w-full h-48 sm:h-64 object-cover"
              />
            </div>
          )}

          <header className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              {author && (
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={author.avatar} alt="" />
                    <AvatarFallback>
                      {author.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">{author.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.date}>
                  {formatDate(post.date) || "Unknown date"}
                </time>
              </div>
            </div>
          </header>

          <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-img:rounded-lg prose-img:shadow-md prose-img:border prose-img:border-border">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSlug]}
              components={{
                img: ({ src, alt, ...props }) => (
                  <span className="block my-6 w-full max-w-3xl mx-auto">
                    <img
                      src={src}
                      alt={alt ?? ""}
                      className="rounded-xl shadow-md w-full border border-border"
                      {...props}
                    />
                  </span>
                ),
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
              {post.content}
            </ReactMarkdown>
          </article>

          <footer className="mt-16 pt-8 border-t border-border">
            <a
              href="https://www.ardanlabs.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/20 transition-colors"
            >
              <img
                src="/images/ardan-labs-badge.svg"
                alt="Ardan Labs"
                className="h-28 w-auto shrink-0"
              />
              <div>
                <p className="font-medium text-foreground mb-0.5">
                  Kronk is built by Ardan Labs
                </p>
                <p className="text-sm text-muted-foreground">
                  A software engineering firm specializing in Go, Rust, Kubernetes, and AI implementations. We deliver training, consulting, and development services to help teams build scalable systems.
                </p>
                <span className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-2 group-hover:underline">
                  Learn more at ardanlabs.com
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </span>
              </div>
            </a>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default BlogPost;
