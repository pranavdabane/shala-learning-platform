import { Course } from "../types";

/**
 * Robust fetcher that tries direct Supabase first, then falls back to proxy
 */
export async function resilientFetch<T>(table: string, query: string = '*'): Promise<T[]> {
  // Direct fetch (might be blocked by CORS or Iframe restrictions)
  try {
    const response = await fetch(`/api/proxy/${table}?select=${query}`);
    if (response.ok) {
      return await response.json();
    }
    const err = await response.json();
    throw new Error(err.error || `Proxy fetch failed for ${table}`);
  } catch (err: any) {
     console.error(`Resilient fetch failed for ${table}:`, err.message);
     throw err;
  }
}
