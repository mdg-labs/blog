export function glob(options: { base: string; pattern: string }) {
  return { type: "glob" as const, ...options };
}
