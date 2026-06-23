import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

import { blogPostSchema } from "./schema.js";

export type BlogLocale = "en" | "de";

export type DefineBlogCollectionOptions = {
  contentBase: string;
  locales: readonly BlogLocale[];
  defaultAuthor?: string;
};

function buildLocaleSchema(locales: readonly BlogLocale[]) {
  if (locales.length === 0) {
    throw new Error("defineBlogCollection requires at least one locale");
  }

  if (locales.length === 1) {
    return z.literal(locales[0]);
  }

  return z.enum(locales as [BlogLocale, BlogLocale, ...BlogLocale[]]);
}

export function defineBlogCollection({
  contentBase,
  locales,
  defaultAuthor,
}: DefineBlogCollectionOptions) {
  const localeSchema = buildLocaleSchema(locales);

  const schema =
    defaultAuthor !== undefined
      ? blogPostSchema.omit({ author: true }).extend({
          locale: localeSchema,
          author: z.string().default(defaultAuthor),
        })
      : blogPostSchema.extend({ locale: localeSchema });

  return defineCollection({
    loader: glob({ base: contentBase, pattern: "**/*.{md,mdx}" }),
    schema,
  });
}
