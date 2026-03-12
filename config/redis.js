const { createClient } = require("redis");
const Redis = require("ioredis");

const host = process.env.REDIS_HOST || "localhost";
const port = process.env.REDIS_PORT || 6379;
const password = process.env.REDIS_PASSWORD || undefined;

const redisUrl = password
  ? `redis://:${password}@${host}:${port}`
  : `redis://${host}:${port}`;

const client = createClient({
  url: redisUrl,
});

client.connect().catch(console.error);
// config/redis.js
const redis = new Redis({
  host: host,
  port: port,
  password: password,
});

module.exports = { client, redis };
