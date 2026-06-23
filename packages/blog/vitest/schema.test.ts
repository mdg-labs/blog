import { describe, expect, it } from "vitest";

import { defineBlogCollection } from "../src/collection.js";
import { blogPostSchema } from "../src/schema.js";

const validFrontmatter = {
  title: "Hello world",
  description: "A short description of the post.",
  pubDate: "2024-01-15",
  locale: "en" as const,
};

describe("blogPostSchema", () => {
  it("accepts valid frontmatter", () => {
    expect(blogPostSchema.safeParse(validFrontmatter).success).toBe(true);
  });

  it("rejects missing title", () => {
    const { title: _title, ...withoutTitle } = validFrontmatter;
    expect(blogPostSchema.safeParse(withoutTitle).success).toBe(false);
  });

  it("rejects bad slug", () => {
    expect(
      blogPostSchema.safeParse({ ...validFrontmatter, slug: "Bad_Slug" }).success,
    ).toBe(false);
  });

  it("rejects invalid locale", () => {
    expect(
      blogPostSchema.safeParse({ ...validFrontmatter, locale: "fr" }).success,
    ).toBe(false);
  });
});

describe("defineBlogCollection", () => {
  it("returns an object with loader and schema keys", () => {
    const collection = defineBlogCollection({
      contentBase: "./content/blog",
      locales: ["en"],
    });

    expect(collection).toHaveProperty("loader");
    expect(collection).toHaveProperty("schema");
  });
});
