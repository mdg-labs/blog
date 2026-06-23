// @ts-nocheck — copy-paste template; typechecked in consumer Astro project.
/**
 * Copy to: src/pages/blog/rss.xml.ts (website, slugbase, pipewatch)
 *
 * Set `site` to your public marketing origin. PipeWatch: prerender = true.
 */
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import {
  buildRssFeed,
  filterPublished,
  sortPostsByDate,
} from "@mdg-labs/blog";

export const prerender = true;

// TODO(consumer): replace with your site name and public URL
const site = {
  name: "MDG Labs",
  url: "https://example.com",
  description: "Blog posts",
};

export const GET: APIRoute = async () => {
  const posts = sortPostsByDate(
    filterPublished(await getCollection("blog")),
  );

  const xml = buildRssFeed({ site, posts });

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
