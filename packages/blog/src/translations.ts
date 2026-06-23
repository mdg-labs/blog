import type { BlogLocale } from "./collection.js";
import { filterPublished, type BlogPostEntry } from "./filters.js";
import { resolvePostSlug, type PostSlugEntry } from "./slug.js";

const DEFAULT_LOCALES: readonly BlogLocale[] = ["en", "de"];

export type TranslationEntry = PostSlugEntry & {
  data: { locale: BlogLocale };
};

/** Strip locale prefix from entry id → shared folder key (e.g. `en/welcome/index.mdx` → `welcome`). */
export function resolveTranslationKey(
  entry: TranslationEntry,
  locales: readonly BlogLocale[] = DEFAULT_LOCALES,
): string {
  const withoutFile = entry.id
    .replace(/\/index\.(md|mdx)$/i, "")
    .replace(/\.(md|mdx)$/i, "");
  const segments = withoutFile.split("/");

  if (
    segments.length > 1 &&
    locales.includes(segments[0] as BlogLocale)
  ) {
    const rest = segments.slice(1).join("/");
    return rest || segments[0]!;
  }

  return withoutFile;
}

export type TranslationIndex = Map<string, Map<BlogLocale, string>>;

export function buildTranslationIndex<T extends TranslationEntry>(
  posts: T[],
  locales: readonly BlogLocale[] = DEFAULT_LOCALES,
): TranslationIndex {
  const index: TranslationIndex = new Map();

  for (const post of posts) {
    const key = resolveTranslationKey(post, locales);
    const slug = resolvePostSlug(post);
    const byLocale = index.get(key) ?? new Map<BlogLocale, string>();
    byLocale.set(post.data.locale, slug);
    index.set(key, byLocale);
  }

  return index;
}

function trimTrailingSlash(path: string): string {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

function joinBlogPath(base: string, slug: string): string {
  const normalizedBase = trimTrailingSlash(base);
  return `${normalizedBase}/${slug}`;
}

export type BlogLocalePaths = {
  en: string;
  de: string;
};

export type ResolveBlogLocalePathsOptions = {
  enBlogBase?: string;
  deBlogBase?: string;
  locales?: readonly BlogLocale[];
  /** When a locale has no sibling, use its blog index path. Default `/blog` and `/de/blog/`. */
  enBlogIndex?: string;
  deBlogIndex?: string;
};

/**
 * Resolve EN/DE public paths for a blog post, using shared folder names as the translation key.
 */
export function resolveBlogLocalePaths<T extends BlogPostEntry>(
  entry: T,
  posts: T[],
  options: ResolveBlogLocalePathsOptions = {},
): BlogLocalePaths {
  const {
    enBlogBase = "/blog",
    deBlogBase = "/de/blog",
    locales = DEFAULT_LOCALES,
    enBlogIndex = "/blog",
    deBlogIndex = "/de/blog/",
  } = options;

  const index = buildTranslationIndex(filterPublished(posts), locales);
  const key = resolveTranslationKey(entry, locales);
  const slugs = index.get(key);

  const enSlug = slugs?.get("en");
  const deSlug = slugs?.get("de");

  return {
    en: enSlug ? joinBlogPath(enBlogBase, enSlug) : enBlogIndex,
    de: deSlug ? joinBlogPath(deBlogBase, deSlug) : deBlogIndex,
  };
}

/** Alternate path for the site language switcher on a blog post page. */
export function resolveBlogAlternateHref<T extends BlogPostEntry>(
  entry: T,
  posts: T[],
  options: ResolveBlogLocalePathsOptions = {},
): string {
  const paths = resolveBlogLocalePaths(entry, posts, options);
  return entry.data.locale === "de" ? paths.en : paths.de;
}
