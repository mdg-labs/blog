import { describe, expect, it } from "vitest";

import {
  filterByLocale,
  filterPublished,
  paginate,
  sortPostsByDate,
} from "../src/filters.js";
import { resolvePostSlug, slugify } from "../src/slug.js";
import type { BlogPostFrontmatter } from "../src/schema.js";

function makePost(
  id: string,
  overrides: Partial<BlogPostFrontmatter> = {},
): { id: string; data: BlogPostFrontmatter } {
  return {
    id,
    data: {
      title: "Test post",
      description: "A test description.",
      pubDate: new Date("2024-01-01"),
      locale: "en",
      draft: false,
      ...overrides,
    },
  };
}

describe("slugify", () => {
  it("converts text to kebab-case", () => {
    expect(slugify("Hello World")).toBe("hello-world");
    expect(slugify("  Foo_Bar  ")).toBe("foo-bar");
  });
});

describe("resolvePostSlug", () => {
  it("uses data.slug when present", () => {
    expect(
      resolvePostSlug({
        id: "en/my-post/index.mdx",
        data: { slug: "custom-slug" },
      }),
    ).toBe("custom-slug");
  });

  it("derives slug from directory name in entry id", () => {
    expect(
      resolvePostSlug({
        id: "en/my-post/index.mdx",
        data: {},
      }),
    ).toBe("my-post");
  });

  it("handles locale-less paths", () => {
    expect(
      resolvePostSlug({
        id: "announcement/index.mdx",
        data: {},
      }),
    ).toBe("announcement");
  });
});

describe("sortPostsByDate", () => {
  it("orders newest pubDate first", () => {
    const posts = [
      makePost("a", { pubDate: new Date("2024-01-01") }),
      makePost("b", { pubDate: new Date("2024-03-01") }),
      makePost("c", { pubDate: new Date("2024-02-01") }),
    ];

    const sorted = sortPostsByDate(posts).map((post) => post.id);

    expect(sorted).toEqual(["b", "c", "a"]);
  });
});

describe("filterPublished", () => {
  it("excludes draft posts", () => {
    const posts = [
      makePost("published", { draft: false }),
      makePost("draft", { draft: true }),
    ];

    expect(filterPublished(posts).map((post) => post.id)).toEqual(["published"]);
  });
});

describe("filterByLocale", () => {
  it("keeps only matching locale", () => {
    const posts = [
      makePost("en-post", { locale: "en" }),
      makePost("de-post", { locale: "de" }),
    ];

    expect(filterByLocale(posts, "de").map((post) => post.id)).toEqual([
      "de-post",
    ]);
  });
});

describe("paginate", () => {
  it("returns the requested page slice", () => {
    const items = [1, 2, 3, 4, 5];
    const result = paginate(items, 2, 2);

    expect(result.items).toEqual([3, 4]);
    expect(result.currentPage).toBe(2);
    expect(result.totalPages).toBe(3);
    expect(result.totalItems).toBe(5);
  });
});
