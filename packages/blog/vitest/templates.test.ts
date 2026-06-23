import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.resolve(root, "../templates");

const TEMPLATE_FILES: Array<{ file: string; imports: string[] }> = [
  {
    file: "pages/blog-index.astro",
    imports: [
      "@mdg-labs/blog",
      "@mdg-labs/blog/layouts/PostList.astro",
      "filterPublished",
      "sortPostsByDate",
    ],
  },
  {
    file: "pages/blog-post.astro",
    imports: [
      "@mdg-labs/blog",
      "@mdg-labs/blog/layouts/BlogPostLayout.astro",
      "blogMdxComponents",
      "filterPublished",
      "resolvePostSlug",
    ],
  },
  {
    file: "pages/blog-rss.xml.ts",
    imports: ["@mdg-labs/blog", "buildRssFeed", "filterPublished"],
  },
  {
    file: "pages/de/blog-index.astro",
    imports: [
      "@mdg-labs/blog",
      "@mdg-labs/blog/layouts/PostList.astro",
      "filterByLocale",
    ],
  },
  {
    file: "pages/de/blog-post.astro",
    imports: [
      "@mdg-labs/blog",
      "@mdg-labs/blog/layouts/BlogPostLayout.astro",
      "filterByLocale",
      "blogMdxComponents",
    ],
  },
  {
    file: "content.config.snippet.ts",
    imports: ["defineBlogCollection", "@mdg-labs/blog"],
  },
];

describe("route templates", () => {
  it("includes README with consumer copy steps", () => {
    const readme = readFileSync(
      path.join(templatesDir, "README.md"),
      "utf8",
    );
    expect(readme).toContain("website");
    expect(readme).toContain("slugbase");
    expect(readme).toContain("pipewatch");
  });

  it.each(TEMPLATE_FILES)(
    "$file references @mdg-labs/blog imports",
    ({ file, imports }) => {
      const content = readFileSync(path.join(templatesDir, file), "utf8");
      for (const imp of imports) {
        expect(content).toContain(imp);
      }
    },
  );

  it("example-post fixture has required frontmatter", () => {
    const mdx = readFileSync(
      path.resolve(root, "../fixtures/example-post/index.mdx"),
      "utf8",
    );
    expect(mdx).toContain("title:");
    expect(mdx).toContain("locale: en");
    expect(mdx).toContain("<Callout");
  });
});
