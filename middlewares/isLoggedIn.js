const usersModel = require("../models/usersModel");
const jwt = require("jsonwebtoken");
const File = require("../models/fileModel");
const { generateToken } = require("../utils/generateToken");
const { redis } = require("../config/redis");
const { registerCacheKey } = require("../utils/cache");

const USER_CACHE_TTL = 300; // 5 minutes

module.exports = async function (req, res, next) {
  // Check session first
  if (!req.session?.userId) {
    return res.status(401).redirect("/users/login");
  }

  // Check JWT token
  let token = req.cookies.token;
  const refreshToken = req.cookies.refreshToken;

  if (!token && !refreshToken) {
    return res.redirect("/users/login");
  }

  try {
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_KEY);
    } catch (err) {
      if (!refreshToken) throw err;
      // Try refresh token logic
      const refreshDecoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_KEY || "refresh_secret"
      );
      // On refresh, we must hit the DB to verify user is still valid
      const user = await usersModel.findById(refreshDecoded.userId);
      if (!user) throw new Error("User not found");

      // Issue new access token
      const { accessToken } = generateToken(user);
      token = accessToken;
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 15,
      });
      decoded = jwt.verify(token, process.env.JWT_KEY);
    }

    // ── CACHE the user object in Redis to avoid a DB hit on every request ──
    const cacheKey = `user:${decoded.email}`;
    let user;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        user = JSON.parse(cached);
      }
    } catch (_) { /* Redis miss — fall through to DB */ }

    if (!user) {
      user = await usersModel
        .findOne({ email: decoded.email })
        .select("-password")
        .lean();

      if (!user) return res.redirect("/users/login");

      // Cache it for 5 minutes
      try {
        await redis.set(cacheKey, JSON.stringify(user), "EX", USER_CACHE_TTL);
      } catch (_) { /* Cache write failure is non-fatal */ }
    }

    // Refresh the token cookie to match rolling session behavior
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 15,
    });

    req.user = user;
    res.locals.user = user;

    // Calculate Storage Used
    const storageCacheKey = `user:storage:${user._id}`;
    let storageUsed = 0;
    try {
      const cachedStorage = await redis.get(storageCacheKey);
      if (cachedStorage !== null) {
        storageUsed = parseInt(cachedStorage, 10);
      } else {
        const mongoose = require("mongoose");
        const ownerId = new mongoose.Types.ObjectId(user._id);
        const aggregateResult = await File.aggregate([
          { $match: { owner: ownerId, type: "file" } },
          { $group: { _id: null, totalSize: { $sum: "$size" } } }
        ]);
        storageUsed = aggregateResult.length > 0 ? aggregateResult[0].totalSize : 0;
        await redis.set(storageCacheKey, storageUsed.toString(), "EX", USER_CACHE_TTL);
        await registerCacheKey(user._id, storageCacheKey);
      }
    } catch (err) {
      console.error("Storage measurement error:", err.message);
    }
    
    res.locals.storageUsed = storageUsed;
    res.locals.storageLimit = 15 * 1024 * 1024 * 1024; // 15 GB

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    let formattedUsed = '0 Bytes';
    if (storageUsed > 0) {
      const i = Math.floor(Math.log(storageUsed) / Math.log(k));
      formattedUsed = `${parseFloat((storageUsed / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    }

    res.locals.storageUsedFormatted = formattedUsed;
    res.locals.storagePercentage = Math.min(100, (storageUsed / res.locals.storageLimit) * 100).toFixed(1);

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.redirect("/users/login");
  }
};
