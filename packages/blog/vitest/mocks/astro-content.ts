export function defineCollection<T extends { loader: unknown; schema: unknown }>(
  config: T,
): T {
  return config;
}
