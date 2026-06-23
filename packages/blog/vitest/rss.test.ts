import { describe, expect, it } from "vitest";

import { buildBlogPostingJsonLd } from "../src/json-ld.js";
import { buildRssFeed } from "../src/rss.js";
import type { BlogPostFrontmatter } from "../src/schema.js";

const site = {
  name: "MDG Labs",
  url: "https://mdg-labs.com",
  description: "Product updates and engineering notes",
};

function makePost(
  id: string,
  overrides: Partial<BlogPostFrontmatter> = {},
): { id: string; data: BlogPostFrontmatter } {
  return {
    id,
    data: {
      title: "Launch day",
      description: "We shipped the first version.",
      pubDate: new Date("2024-06-15T10:00:00.000Z"),
      locale: "en",
      draft: false,
      ...overrides,
    },
  };
}

function isWellFormedXml(xml: string): boolean {
  const stack: string[] = [];
  const tagPattern = /<\/?([a-zA-Z][\w:.-]*)(?:\s[^>]*)?\s*\/?>/g;

  for (const match of xml.matchAll(tagPattern)) {
    const tag = match[0];

    if (tag.startsWith("<?") || tag.startsWith("<!")) {
      continue;
    }

    if (tag.endsWith("/>")) {
      continue;
    }

    const name = match[1];

    if (tag.startsWith("</")) {
      if (stack.pop() !== name) {
        return false;
      }
      continue;
    }

    stack.push(name);
  }

  return stack.length === 0;
}

describe("buildRssFeed", () => {
  it("outputs parseable RSS XML with channel and item fields", () => {
    const xml = buildRssFeed({
      site,
      posts: [makePost("en/launch-day/index.mdx", { slug: "launch-day" })],
    });

    expect(xml).toContain("<rss");
    expect(xml).toContain("<title>Launch day</title>");
    expect(xml).toContain("<link>https://mdg-labs.com/blog/launch-day/</link>");
    expect(isWellFormedXml(xml)).toBe(true);
  });

  it("filters items by locale when provided", () => {
    const xml = buildRssFeed({
      site,
      locale: "de",
      posts: [
        makePost("en/post/index.mdx", { title: "English", locale: "en" }),
        makePost("de/post/index.mdx", { title: "Deutsch", locale: "de" }),
      ],
    });

    expect(xml).toContain("<title>Deutsch</title>");
    expect(xml).not.toContain("<title>English</title>");
  });
});

describe("buildBlogPostingJsonLd", () => {
  it("returns BlogPosting with headline and datePublished", () => {
    const jsonLd = buildBlogPostingJsonLd(
      makePost("en/launch-day/index.mdx", { slug: "launch-day" }),
      site,
    );

    expect(jsonLd["@type"]).toBe("BlogPosting");
    expect(jsonLd.headline).toBe("Launch day");
    expect(jsonLd.datePublished).toBe("2024-06-15T10:00:00.000Z");
    expect(jsonLd.url).toBe("https://mdg-labs.com/blog/launch-day/");
  });
});
