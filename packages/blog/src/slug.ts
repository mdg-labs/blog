export type PostSlugEntry = {
  id: string;
  data: {
    slug?: string;
  };
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function resolvePostSlug(entry: PostSlugEntry): string {
  if (entry.data.slug) {
    return entry.data.slug;
  }

  const withoutFile = entry.id
    .replace(/\/index\.(md|mdx)$/i, "")
    .replace(/\.(md|mdx)$/i, "");
  const segments = withoutFile.split("/");

  return segments.at(-1) ?? withoutFile;
}
