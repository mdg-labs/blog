import type { BlogPostFrontmatter } from "./schema.js";
import { resolvePostSlug } from "./slug.js";

import type { BlogSite } from "./rss.js";

export type BlogPostJsonLdInput = {
  id: string;
  data: BlogPostFrontmatter;
};

function toIsoDate(date: Date): string {
  return date.toISOString();
}

function postUrl(siteUrl: string, slug: string): string {
  const base = siteUrl.replace(/\/$/, "");
  return `${base}/blog/${slug}/`;
}

export function buildBlogPostingJsonLd(
  post: BlogPostJsonLdInput,
  site: BlogSite,
): Record<string, unknown> {
  const slug = resolvePostSlug(post);
  const url = post.data.canonicalUrl ?? postUrl(site.url, slug);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.data.title,
    description: post.data.description,
    datePublished: toIsoDate(post.data.pubDate),
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
    inLanguage: post.data.locale,
  };

  if (post.data.updatedDate) {
    jsonLd.dateModified = toIsoDate(post.data.updatedDate);
  }

  if (post.data.author) {
    jsonLd.author = {
      "@type": "Person",
      name: post.data.author,
    };
  }

  if (post.data.heroImage) {
    jsonLd.image = post.data.heroImage;
  }

  return jsonLd;
}
