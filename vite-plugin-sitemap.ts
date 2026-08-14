import { Plugin } from "vite";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const SITE_URL = "https://www.kronkai.com";

const STATIC_ROUTES = [
  "",
  "/blog",
  "/manual",
  "/bucky",
  "/showcase",
  "/sponsors",
  "/contributors",
  "/privacy",
  "/terms",
];

export function sitemapPlugin(): Plugin {
  return {
    name: "sitemap",
    apply: "build",
    closeBundle() {
      const root = process.cwd();
      const distDir = join(root, "dist");
      const publicDir = join(root, "public");

      const routes = [...STATIC_ROUTES];

      try {
        const postsJsonPath = join(publicDir, "blog", "posts.json");
        const postsJson: { slug: string; date?: string }[] = JSON.parse(
          readFileSync(postsJsonPath, "utf-8")
        );
        for (const post of postsJson) {
          routes.push(`/blog/${post.slug}`);
        }
      } catch {
        // posts.json may not exist
      }

      const today = new Date().toISOString().slice(0, 10);
      const urls = routes
        .map((path) => {
          const loc = `${SITE_URL}${path || "/"}`;
          return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${path.startsWith("/blog/") ? "weekly" : "monthly"}</changefreq>
    <priority>${path === "" ? "1.0" : path === "/blog" ? "0.9" : "0.8"}</priority>
  </url>`;
        })
        .join("\n");

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

      writeFileSync(join(distDir, "sitemap.xml"), sitemap);
    },
  };
}
