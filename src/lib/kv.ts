import { Redis } from '@upstash/redis';

let _redis: Redis | null = null;

export function getKv(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return _redis;
}

// Backward-compatible `kv` object with lazy init via getter
export const kv = {
  get: <T>(key: string) => getKv().get<T>(key),
  set: (key: string, value: unknown) => getKv().set(key, value),
  del: (...keys: string[]) => getKv().del(...keys),
};

// Helper functions for common operations
export async function getJson<T>(key: string): Promise<T | null> {
  const data = await kv.get(key);
  return data as T | null;
}

export async function setJson(key: string, value: unknown): Promise<void> {
  await kv.set(key, value);
}

export async function deleteKey(key: string): Promise<void> {
  await kv.del(key);
}
