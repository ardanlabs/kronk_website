import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { getAllPosts, formatDate, getAuthor } from "@/lib/blog";
import { Calendar, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Blog = () => {
  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: getAllPosts,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Blog</h1>
          <p className="text-muted-foreground mb-12">
            News, guides, and updates about Kronk.
          </p>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading posts...</p>
            </div>
          )}

          {isError && (
            <p className="text-destructive text-center py-12">
              Failed to load blog posts.
            </p>
          )}

          {posts && posts.length > 0 && (
            <div className="space-y-8">
              {posts.map((post) => {
                const author = getAuthor(post.author);
                return (
                  <article
                    key={post.slug}
                    className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50"
                  >
                    <Link to={`/blog/${post.slug}`} className="block">
                      <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {author && (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={author.avatar} alt="" />
                              <AvatarFallback>
                                {author.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{author.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <time dateTime={post.date}>
                            {formatDate(post.date) || "Unknown date"}
                          </time>
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          )}

          {posts && posts.length === 0 && !isLoading && (
            <p className="text-muted-foreground text-center py-12">
              No posts yet. Check back soon!
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Blog;
