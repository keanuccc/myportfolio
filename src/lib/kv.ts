import { kv } from '@vercel/kv';

export { kv };

// Helper functions for common operations
export async function getJson<T>(key: string): Promise<T | null> {
  const data = await kv.get(key);
  return data as T | null;
}

export async function setJson(key: string, value: unknown): Promise<void> {
  await kv.set(key, JSON.stringify(value));
}

export async function deleteKey(key: string): Promise<void> {
  await kv.del(key);
}
