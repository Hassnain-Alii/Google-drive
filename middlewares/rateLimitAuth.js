// middlewares/rateLimitAuth.js
const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis").default;
const { client } = require("../config/redis");
// const redis = require("../config/redis");

exports.authLimiter = rateLimit({
  store: new RedisStore({
    prefix: "rl:auth:email:",
    keyGenerator: (req) => req.body.email || req.ip, // group by email
    sendCommand: (...args) => client.sendCommand(args),
  }),

  windowMs: 10 * 1000,
  max: 5, // 5 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,

  message: { error: "Too many attempts, please try again later." },
});
