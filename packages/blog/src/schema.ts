import { z } from "astro/zod";

const kebabSlug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case");

export const blogPostSchema = z.object({
  title: z.string().max(120),
  description: z.string().max(300),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  slug: kebabSlug.optional(),
  locale: z.enum(["en", "de"]),
  draft: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
  heroImage: z.string().optional(),
  ogImage: z.string().optional(),
  canonicalUrl: z.string().url().optional(),
});

export type BlogPostFrontmatter = z.infer<typeof blogPostSchema>;
