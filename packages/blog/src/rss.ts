import type { BlogPostEntry } from "./filters.js";
import { resolvePostSlug } from "./slug.js";

export type BlogSite = {
  name: string;
  url: string;
  description?: string;
};

export type BuildRssFeedOptions<T extends BlogPostEntry> = {
  site: BlogSite;
  posts: T[];
  locale?: BlogPostEntry["data"]["locale"];
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatRfc822Date(date: Date): string {
  return date.toUTCString();
}

function postUrl(siteUrl: string, slug: string): string {
  const base = siteUrl.replace(/\/$/, "");
  return `${base}/blog/${slug}/`;
}

export function buildRssFeed<T extends BlogPostEntry>({
  site,
  posts,
  locale,
}: BuildRssFeedOptions<T>): string {
  const filteredPosts = locale
    ? posts.filter((post) => post.data.locale === locale)
    : posts;

  const items = filteredPosts
    .map((post) => {
      const slug = resolvePostSlug(post);
      const link = post.data.canonicalUrl ?? postUrl(site.url, slug);

      return [
        "    <item>",
        `      <title>${escapeXml(post.data.title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <description>${escapeXml(post.data.description)}</description>`,
        `      <pubDate>${formatRfc822Date(post.data.pubDate)}</pubDate>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const channelDescription = site.description ?? `${site.name} blog`;

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "  <channel>",
    `    <title>${escapeXml(site.name)}</title>`,
    `    <link>${escapeXml(site.url)}</link>`,
    `    <description>${escapeXml(channelDescription)}</description>`,
    items,
    "  </channel>",
    "</rss>",
  ].join("\n");
}
