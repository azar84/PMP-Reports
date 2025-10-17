import { prisma } from './db';

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

// Cache utility functions
export function getCacheKey(prefix: string, params: Record<string, any>): string {
  return `${prefix}:${JSON.stringify(params)}`;
}

export function getFromCache<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function clearCache(prefix?: string): void {
  if (prefix) {
    for (const key of cache.keys()) {
      if (key.startsWith(prefix)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
}

// Optimized query functions
export async function getSiteSettings() {
  const cacheKey = getCacheKey('site-settings', {});
  const cached = getFromCache(cacheKey);
  
  if (cached) {
    return cached;
  }

  const settings = await prisma.siteSettings.findFirst();
  setCache(cacheKey, settings);
  return settings;
}

export async function getDesignSystem() {
  const cacheKey = getCacheKey('design-system', {});
  const cached = getFromCache(cacheKey);
  
  if (cached) {
    return cached;
  }

  const designSystem = await prisma.designSystem.findFirst({
    where: { isActive: true }
  });
  setCache(cacheKey, designSystem);
  return designSystem;
}
