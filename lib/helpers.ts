export function toAbsoluteUrl(pathname: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_PATH;

  if (baseUrl && baseUrl !== "/") {
    return baseUrl + pathname;
  }

  return pathname;
}
