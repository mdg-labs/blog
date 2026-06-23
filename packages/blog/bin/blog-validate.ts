#!/usr/bin/env tsx

import { validateBlogContent } from "../src/validate.ts";

const contentBase = process.argv[2];

if (!contentBase) {
  console.error("Usage: blog-validate <contentBase>");
  process.exit(1);
}

const result = validateBlogContent(contentBase);

for (const warning of result.warnings) {
  console.error(`warning: ${warning.file}: ${warning.message}`);
}

for (const error of result.errors) {
  console.error(`error: ${error.file}: ${error.message}`);
}

process.exit(result.ok ? 0 : 1);
