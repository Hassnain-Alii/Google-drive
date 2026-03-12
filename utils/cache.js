// utils/cacheHit.js
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
    console.error("Cache/DB Error:", error);
  }
  const data = await fetcher();
  if (data !== undefined) {
    try {
      const value = typeof data === "string" ? data : JSON.stringify(data);
      await redis.set(key, value, "EX", ttlSeconds);
    } catch (error) {
      console.error("Cache/DB Error:", error);
    }
  }
  return data;
}

async function invalidateCache(userId) {
  try {
    const keys = await redis.keys(`*:${userId}:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(
        `🗑️ Invalidated ${keys.length} cache keys for user ${userId}`
      );
    }
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }
}

module.exports = { cacheHit, invalidateCache };
