#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const binDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.join(binDir, "..");
const require = createRequire(path.join(packageRoot, "package.json"));
const tsxCli = path.join(path.dirname(require.resolve("tsx/package.json")), "dist/cli.mjs");
const cliScript = path.join(binDir, "blog-validate.ts");
const contentBase = process.argv[2];

if (!contentBase) {
  console.error("Usage: blog-validate <contentBase>");
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  [tsxCli, cliScript, contentBase],
  {
    stdio: "inherit",
    cwd: packageRoot,
  },
);

process.exit(result.status ?? 1);
