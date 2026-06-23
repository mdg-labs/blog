declare module "astro:content" {
  export function defineCollection<T extends { loader: unknown; schema: unknown }>(
    config: T,
  ): T;
}

declare module "astro/loaders" {
  export function glob(options: { base: string; pattern: string }): unknown;
}
