export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();

  if (!baseUrl) {
    return normalizedPath;
  }

  return `${baseUrl.replace(/\/+$/, "")}${normalizedPath}`;
}
