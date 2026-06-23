import fs from "node:fs";
import path from "node:path";

import yaml from "js-yaml";

import { blogPostSchema } from "./schema.js";
import { resolvePostSlug } from "./slug.js";

const MARKDOWN_EXTENSIONS = new Set([".md", ".mdx"]);

export type ValidateBlogContentOptions = {
  warnMissingHeroImage?: boolean;
};

export type ValidationProblem = {
  file: string;
  message: string;
};

export type ValidateBlogContentResult = {
  ok: boolean;
  errors: ValidationProblem[];
  warnings: ValidationProblem[];
};

function walkMarkdownFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMarkdownFiles(fullPath));
    } else if (entry.isFile() && MARKDOWN_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
}

function parseFrontmatter(raw: string): Record<string, unknown> {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    throw new Error("Missing frontmatter delimiters (---)");
  }

  const parsed = yaml.load(match[1]);
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Frontmatter must be a YAML object");
  }

  return parsed as Record<string, unknown>;
}

function relativeEntryId(contentBase: string, filePath: string): string {
  return path.relative(contentBase, filePath).split(path.sep).join("/");
}

export function validateBlogContent(
  contentBase: string,
  options: ValidateBlogContentOptions = {},
): ValidateBlogContentResult {
  const { warnMissingHeroImage = true } = options;
  const errors: ValidationProblem[] = [];
  const warnings: ValidationProblem[] = [];
  const slugByLocale = new Map<string, Map<string, string[]>>();

  const absoluteBase = path.resolve(contentBase);

  if (!fs.existsSync(absoluteBase)) {
    return {
      ok: false,
      errors: [
        {
          file: contentBase,
          message: `Content base does not exist: ${contentBase}`,
        },
      ],
      warnings: [],
    };
  }

  const files = walkMarkdownFiles(absoluteBase);

  for (const filePath of files) {
    const relFile = relativeEntryId(absoluteBase, filePath);
    let raw: string;

    try {
      raw = fs.readFileSync(filePath, "utf8");
    } catch (err) {
      errors.push({
        file: relFile,
        message: `Unable to read file: ${err instanceof Error ? err.message : String(err)}`,
      });
      continue;
    }

    let frontmatter: Record<string, unknown>;
    try {
      frontmatter = parseFrontmatter(raw);
    } catch (err) {
      errors.push({
        file: relFile,
        message: err instanceof Error ? err.message : String(err),
      });
      continue;
    }

    const parsed = blogPostSchema.safeParse(frontmatter);
    if (!parsed.success) {
      const issues = parsed.error.issues
        .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
        .join("; ");
      errors.push({ file: relFile, message: issues });
      continue;
    }

    const data = parsed.data;
    const slug = resolvePostSlug({ id: relFile, data });
    const localeSlugs = slugByLocale.get(data.locale) ?? new Map<string, string[]>();
    const slugFiles = localeSlugs.get(slug) ?? [];
    slugFiles.push(relFile);
    localeSlugs.set(slug, slugFiles);
    slugByLocale.set(data.locale, localeSlugs);

    if (warnMissingHeroImage && data.heroImage) {
      const heroPath = path.resolve(path.dirname(filePath), data.heroImage);
      if (!fs.existsSync(heroPath)) {
        warnings.push({
          file: relFile,
          message: `heroImage not found on disk: ${data.heroImage}`,
        });
      }
    }
  }

  for (const [locale, slugs] of slugByLocale) {
    for (const [slug, fileList] of slugs) {
      if (fileList.length > 1) {
        errors.push({
          file: fileList.join(", "),
          message: `Duplicate slug "${slug}" for locale "${locale}"`,
        });
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}
