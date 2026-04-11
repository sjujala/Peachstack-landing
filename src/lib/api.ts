const API_BASE = ((import.meta as any).env?.VITE_API_URL as string) || '';
export const apiUrl = (path: string) => `${API_BASE}${path}`;

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(apiUrl(path), { credentials: 'include', ...options });
  return res;
}
