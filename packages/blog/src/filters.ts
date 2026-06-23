import type { BlogPostFrontmatter } from "./schema.js";

export type BlogPostEntry = {
  id: string;
  data: BlogPostFrontmatter;
};

export type PaginatedResult<T> = {
  items: T[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export function sortPostsByDate<T extends BlogPostEntry>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
}

export function filterPublished<T extends BlogPostEntry>(posts: T[]): T[] {
  return posts.filter((post) => !post.data.draft);
}

export function filterByLocale<T extends BlogPostEntry>(
  posts: T[],
  locale: BlogPostFrontmatter["locale"],
): T[] {
  return posts.filter((post) => post.data.locale === locale);
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  const safePageSize = Math.max(1, pageSize);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * safePageSize;

  return {
    items: items.slice(start, start + safePageSize),
    currentPage,
    pageSize: safePageSize,
    totalItems,
    totalPages,
  };
}
