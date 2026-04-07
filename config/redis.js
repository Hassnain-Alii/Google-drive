const { createClient } = require("redis");
const Redis = require("ioredis");
require("dotenv").config();

const redisUrl = process.env.REDIS_URL;

// Use ioredis for the main session/cache (Better for Upstash and serverless)
// For Upstash, rediss protocol handles TLS automatically
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redis.on("error", (err) => {
  console.error("Redis (ioredis) Error:", err);
});

// For express-rate-limit-redis or similar that might need 'redis' package
const client = createClient({
  url: redisUrl,
});

client.on("error", (err) => {
  console.error("Redis (createClient) Error:", err);
});

client.connect().catch((err) => {
  console.error("Failed to connect to Redis Client:", err.message);
});

module.exports = { client, redis };
