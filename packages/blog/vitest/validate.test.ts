import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { validateBlogContent } from "../src/validate.js";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const cliPath = path.join(packageRoot, "bin/blog-validate.mjs");
const fixturesRoot = path.join(packageRoot, "vitest/fixtures");

function runCli(contentBase: string) {
  return spawnSync(process.execPath, [cliPath, contentBase], {
    encoding: "utf8",
    cwd: packageRoot,
  });
}

describe("validateBlogContent", () => {
  it("accepts valid fixture content", () => {
    const result = validateBlogContent(path.join(fixturesRoot, "valid"));

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("reports schema errors for invalid fixture content", () => {
    const result = validateBlogContent(path.join(fixturesRoot, "invalid"));

    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]?.file).toContain("bad-slug/index.mdx");
  });

  it("fails when duplicate slugs exist in the same locale", () => {
    const result = validateBlogContent(
      path.join(fixturesRoot, "duplicate-slug"),
    );

    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.message.includes("Duplicate slug"))).toBe(
      true,
    );
  });

  it("warns when heroImage path is missing on disk", () => {
    const result = validateBlogContent(path.join(fixturesRoot, "valid"), {
      warnMissingHeroImage: true,
    });

    expect(result.ok).toBe(true);
    expect(result.warnings).toEqual([]);
  });
});

describe("blog-validate CLI", () => {
  it("exits 0 for valid fixtures", () => {
    const result = runCli(path.join(fixturesRoot, "valid"));

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
  });

  it("exits non-zero with readable stderr for invalid fixtures", () => {
    const result = runCli(path.join(fixturesRoot, "invalid"));

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/error:.*bad-slug\/index\.mdx:/);
    expect(result.stderr.length).toBeGreaterThan(0);
  });

  it("exits non-zero for duplicate slug fixtures", () => {
    const result = runCli(path.join(fixturesRoot, "duplicate-slug"));

    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/Duplicate slug/);
  });
});
