const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const { cacheHit, registerCacheKey } = require("../utils/cache");
const File = require("../models/fileModel");

// Wrapper: gets from cache (or fetches from DB), registers key for fast invalidation
const send = async (res, userId, key, fetcher) => {
  try {
    const data = await cacheHit(key, 300, fetcher);
    registerCacheKey(userId, key); // fire-and-forget — do NOT await
    return data;
  } catch (error) {
    console.error("Cache/DB Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

router.get("/home", isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.userId;
    const folderKey = `home:${userId}:folders`;
    const fileKey = `home:${userId}:files`;

    // Run both queries in parallel — saves time vs sequential awaits
    const [suggFolderList, suggFileList] = await Promise.all([
      send(res, userId, folderKey, () =>
        File.find({ owner: userId, type: "folder", status: "active" })
          .sort({ updatedAt: -1 })
          .limit(5)
          .lean()
      ),
      send(res, userId, fileKey, () =>
        File.find({ owner: userId, type: "file", status: "active" })
          .sort({ updatedAt: -1 })
          .lean()
      ),
    ]);

    res.json({ suggFolderList, suggFileList });
  } catch (err) {
    console.error("Error fetching home data:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/view", isLoggedIn, async (req, res) => {
  const view = req.query.view || "home";
  const folderId = req.query.folderId;
  const userId = req.session.userId;

  const key = `view:${userId}:${view}:${folderId || "root"}`;

  const query = {
    home:             { owner: userId, status: "active" },
    "my-drive":       { owner: userId, parent: folderId || "my-drive", label: { $in: ["myDrive", "recent", "starred"] }, status: "active" },
    computers:        { owner: userId, parent: folderId || "my-drive", label: "computer", status: "active" },
    "shared-with-me": { owner: userId, label: "sharedWithMe", status: "active" },
    recent:           { owner: userId, label: "recent", status: "active" },
    starred:          { owner: userId, starred: true, label: "starred", status: "active" },
    spam:             { owner: userId, label: "spam", status: "spam" },
    bin:              { owner: userId, label: "bin", status: "trash" },
    storage:          { owner: userId, status: "active" },
  };

  try {
    const files = await send(res, userId, key, () =>
      File.find(query[view] || query["my-drive"])
        .sort(view === "recent" ? { updatedAt: -1 } : { name: 1 })
        .lean()
    );

    res.json(files);
  } catch (err) {
    console.error("Error fetching view data:", err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

router.get("/search", isLoggedIn, async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json([]);

    const userId = req.session.userId;

    // Use MongoDB text index (fast) instead of $regex (slow full-scan)
    const files = await File.find({
      $text: { $search: q },
      owner: userId,
      status: "active",
    }).lean();

    res.json(files);
  } catch (error) {
    console.error("Search API Error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

module.exports = router;
