import { Plugin } from "vite";
import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import matter from "gray-matter";

const SITE_URL = "https://www.kronkai.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/kronkai-twitter.png`;

interface PostMeta {
  slug: string;
  file?: string;
  title: string;
  excerpt: string;
  banner?: string;
  ogImage?: string;
}

function toAbsoluteUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${encodeURI(p)}`;
}

export function blogMetaPlugin(): Plugin {
  return {
    name: "blog-meta",
    apply: "build",
    closeBundle() {
      const root = process.cwd();
      const distDir = join(root, "dist");
      const publicDir = join(root, "public");

      const indexHtml = readFileSync(join(distDir, "index.html"), "utf-8");
      const postsJsonPath = join(publicDir, "blog", "posts.json");
      const postsJson: PostMeta[] = JSON.parse(
        readFileSync(postsJsonPath, "utf-8")
      );

      for (const meta of postsJson) {
        let ogImagePath = meta.ogImage;
        if (!ogImagePath && meta.file) {
          try {
            const mdPath = join(publicDir, "blog", "posts", `${meta.file}.md`);
            const raw = readFileSync(mdPath, "utf-8");
            const { data } = matter(raw);
            ogImagePath = (data.ogImage as string) || (data.banner as string) || undefined;
          } catch {
            // ignore
          }
        }

        const ogImage = ogImagePath ? toAbsoluteUrl(ogImagePath) : DEFAULT_OG_IMAGE;
        const ogTitle = meta.title;
        const ogDescription = meta.excerpt || "";
        const ogUrl = `${SITE_URL}/blog/${meta.slug}`;

        const customHtml = indexHtml
          .replace(
            /<meta name="description" content="[^"]*" \/>/,
            `<meta name="description" content="${ogDescription.replace(/"/g, "&quot;")}" />`
          )
          .replace(
            /<meta property="og:title" content="[^"]*" \/>/,
            `<meta property="og:title" content="${ogTitle.replace(/"/g, "&quot;")}" />`
          )
          .replace(
            /<meta property="og:description" content="[^"]*" \/>/,
            `<meta property="og:description" content="${ogDescription.replace(/"/g, "&quot;")}" />`
          )
          .replace(
            /<meta property="og:image" content="[^"]*" \/>/,
            `<meta property="og:image" content="${ogImage}" />`
          )
          .replace(
            /<meta property="og:url" content="[^"]*" \/>/,
            `<meta property="og:url" content="${ogUrl}" />`
          )
          .replace(
            /<meta name="twitter:image" content="[^"]*" \/>/,
            `<meta name="twitter:image" content="${ogImage}" />`
          )
          .replace(
            /<meta name="twitter:image:alt" content="[^"]*" \/>/,
            `<meta name="twitter:image:alt" content="${ogTitle.replace(/"/g, "&quot;")}" />`
          )
          .replace(
            /<title>[^<]*<\/title>/,
            `<title>${ogTitle} — Kronk</title>`
          );

        const outPath = join(distDir, "blog", `${meta.slug}.html`);
        mkdirSync(dirname(outPath), { recursive: true });
        writeFileSync(outPath, customHtml);
      }

      // Generate manual.html with custom og:image
      const manualOgImage = toAbsoluteUrl("/images/kronk-user-manual.jpg");
      const manualHtml = indexHtml
        .replace(
          /<meta property="og:title" content="[^"]*" \/>/,
          `<meta property="og:title" content="Kronk User Manual" />`
        )
        .replace(
          /<meta property="og:description" content="[^"]*" \/>/,
          `<meta property="og:description" content="Complete guide to running models with the Kronk SDK and model server." />`
        )
        .replace(
          /<meta property="og:image" content="[^"]*" \/>/,
          `<meta property="og:image" content="${manualOgImage}" />`
        )
        .replace(
          /<meta property="og:url" content="[^"]*" \/>/,
          `<meta property="og:url" content="${SITE_URL}/manual" />`
        )
        .replace(
          /<meta name="twitter:image" content="[^"]*" \/>/,
          `<meta name="twitter:image" content="${manualOgImage}" />`
        )
        .replace(
          /<meta name="twitter:image:alt" content="[^"]*" \/>/,
          `<meta name="twitter:image:alt" content="Kronk User Manual" />`
        )
        .replace(
          /<title>[^<]*<\/title>/,
          `<title>Kronk User Manual — Kronk</title>`
        );
      writeFileSync(join(distDir, "manual.html"), manualHtml);
    },
  };
}
