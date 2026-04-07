const { redis } = require("../config/redis");

async function cacheHit(key, ttlSeconds, fetcher) {
  try {
    const raw = await redis.get(key);
    if (raw !== null) {
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    }
  } catch (error) {
    console.error("Cache read error:", error.message);
  }

  const data = await fetcher();

  if (data !== undefined) {
    try {
      const value = typeof data === "string" ? data : JSON.stringify(data);
      redis.set(key, value, "EX", ttlSeconds); // fire-and-forget, don't await
    } catch (error) {
      console.error("Cache write error:", error.message);
    }
  }

  return data;
}

/**
 * Invalidate all cache keys for a user.
 * Uses a Redis Set (user:index:{userId}) to track all keys — 
 * avoids the slow O(N) KEYS scan that redis.keys() uses on production.
 */
async function invalidateCache(userId) {
  try {
    const indexKey = `user:index:${userId}`;
    const keys = await redis.smembers(indexKey);

    if (keys.length > 0) {
      const pipeline = redis.pipeline();
      keys.forEach((k) => pipeline.del(k));
      pipeline.del(indexKey);
      await pipeline.exec();
    }
  } catch (error) {
    console.error("Cache invalidation error:", error.message);
  }
}

/**
 * Register a cache key in the user's index so it can be invalidated later.
 * Call this after setting a cache key for user-specific data.
 */
async function registerCacheKey(userId, key) {
  try {
    const indexKey = `user:index:${userId}`;
    await redis.sadd(indexKey, key);
    await redis.expire(indexKey, 3600); // keep index for 1 hour max
  } catch (_) { /* non-fatal */ }
}

module.exports = { cacheHit, invalidateCache, registerCacheKey };
