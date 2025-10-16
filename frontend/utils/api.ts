export function getApiBaseUrl(isServer: boolean): string {
  if (isServer) {
    return process.env.API_INTERNAL_URL || 'http://backend:8000/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || '/api';
}

export function apiUrl(path: string, isServer: boolean): string {
  const base = getApiBaseUrl(isServer);
  if (path.startsWith('/')) return `${base}${path}`;
  return `${base}/${path}`;
}
