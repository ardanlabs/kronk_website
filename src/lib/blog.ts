import matter from "gray-matter";

export interface Author {
  id: string;
  name: string;
  avatar: string;
}

export const AUTHORS: Record<string, Author> = {
  "bill-kennedy": {
    id: "bill-kennedy",
    name: "Bill Kennedy",
    avatar: "/blog/images/bill-kennedy.png",
  },
};

export interface BlogPostMeta {
  slug: string;
  file?: string;
  title: string;
  date: string;
  excerpt: string;
  author?: string;
  banner?: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

export function getAuthor(id: string | undefined): Author | null {
  if (!id) return null;
  return AUTHORS[id] ?? null;
}

const getBase = () =>
  typeof window !== "undefined" ? window.location.origin : "";
const getBasePath = () => import.meta.env.BASE_URL;

export async function getAllPosts(): Promise<BlogPostMeta[]> {
  const res = await fetch(`${getBase()}${getBasePath()}blog/posts.json`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch blog posts");
  const posts: BlogPostMeta[] = await res.json();
  return posts.sort(
    (a, b) =>
      new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
  );
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const key = slug?.trim();
  if (!key) return null;

  const posts = await getAllPosts();
  const meta = posts.find((p) => p.slug === key);
  const filename = meta?.file || key;

  const url = `${getBase()}${getBasePath()}blog/posts/${filename}.md`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;

  const raw = await res.text();
  if (raw.trimStart().startsWith("<")) return null;

  let data: Record<string, unknown>;
  let content: string;
  try {
    const parsed = matter(raw);
    data = parsed.data as Record<string, unknown>;
    content = parsed.content;
  } catch {
    return null;
  }

  let dateStr = "";
  const d = data.date;
  if (d instanceof Date && !isNaN(d.getTime())) {
    dateStr = d.toISOString().slice(0, 10);
  } else if (typeof d === "string" && d.trim()) {
    dateStr = d.trim();
  }

  return {
    slug: (data.slug as string) || key,
    title: (data.title as string) || "Untitled",
    date: dateStr,
    excerpt: (data.excerpt as string) || "",
    author: (data.author as string) || undefined,
    banner: (data.banner as string) || undefined,
    content,
  };
}

export function formatDate(dateStr: string): string {
  if (!dateStr?.trim()) return "";
  const d = new Date(dateStr.trim());
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
