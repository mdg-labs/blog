import { describe, expect, it } from "vitest";

import type { BlogPostFrontmatter } from "../src/schema.js";
import {
  buildTranslationIndex,
  resolveBlogAlternateHref,
  resolveBlogLocalePaths,
  resolveTranslationKey,
} from "../src/translations.js";

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

describe("resolveTranslationKey", () => {
  it("strips locale prefix from Astro filePath", () => {
    expect(
      resolveTranslationKey({
        id: "willkommen",
        filePath: "src/content/blog/de/welcome/index.mdx",
        data: { locale: "de" },
      }),
    ).toBe("welcome");
    expect(
      resolveTranslationKey({
        id: "welcome",
        filePath: "src/content/blog/en/welcome/index.mdx",
        data: { locale: "en" },
      }),
    ).toBe("welcome");
  });

  it("strips locale prefix from entry id path", () => {
    expect(
      resolveTranslationKey({
        id: "en/welcome/index.mdx",
        data: { locale: "en" },
      }),
    ).toBe("welcome");
    expect(
      resolveTranslationKey({
        id: "de/welcome/index.mdx",
        data: { locale: "de" },
      }),
    ).toBe("welcome");
  });

  it("uses path as-is when no locale prefix", () => {
    expect(
      resolveTranslationKey({
        id: "announcement/index.mdx",
        data: { locale: "en" },
      }),
    ).toBe("announcement");
  });
});

describe("resolveBlogLocalePaths", () => {
  const posts = [
    makePost("en/welcome/index.mdx", { locale: "en", slug: "welcome" }),
    makePost("de/welcome/index.mdx", { locale: "de", slug: "willkommen" }),
  ];

  it("maps localized slugs via shared folder name", () => {
    expect(resolveBlogLocalePaths(posts[0]!, posts)).toEqual({
      en: "/blog/welcome",
      de: "/de/blog/willkommen",
    });
    expect(resolveBlogLocalePaths(posts[1]!, posts)).toEqual({
      en: "/blog/welcome",
      de: "/de/blog/willkommen",
    });
  });

  it("returns alternate href for language switcher", () => {
    expect(resolveBlogAlternateHref(posts[0]!, posts)).toBe(
      "/de/blog/willkommen",
    );
    expect(resolveBlogAlternateHref(posts[1]!, posts)).toBe("/blog/welcome");
  });

  it("falls back to blog index when a locale sibling is missing", () => {
    const solo = [
      makePost("en/welcome/index.mdx", { locale: "en", slug: "welcome" }),
    ];

    expect(resolveBlogLocalePaths(solo[0]!, solo)).toEqual({
      en: "/blog/welcome",
      de: "/de/blog/",
    });
  });

  it("excludes draft siblings from the index", () => {
    const withDraft = [
      makePost("en/welcome/index.mdx", { locale: "en", slug: "welcome" }),
      makePost("de/welcome/index.mdx", {
        locale: "de",
        slug: "willkommen",
        draft: true,
      }),
    ];

    expect(resolveBlogLocalePaths(withDraft[0]!, withDraft)).toEqual({
      en: "/blog/welcome",
      de: "/de/blog/",
    });
  });
});

describe("buildTranslationIndex", () => {
  it("groups slugs by shared folder key", () => {
    const posts = [
      makePost("en/why-we-build-open-core/index.mdx", {
        locale: "en",
        slug: "why-we-build-open-core",
      }),
      makePost("de/why-we-build-open-core/index.mdx", {
        locale: "de",
        slug: "warum-open-core",
      }),
    ];

    const index = buildTranslationIndex(posts);
    expect(index.get("why-we-build-open-core")).toEqual(
      new Map([
        ["en", "why-we-build-open-core"],
        ["de", "warum-open-core"],
      ]),
    );
  });
});
