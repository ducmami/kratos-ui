export type Search = Record<string, string | string[] | undefined>;

export function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

export function isQuerySet(
  value: string | string[] | undefined,
): value is string {
  return typeof value === "string" && value.length > 0;
}
