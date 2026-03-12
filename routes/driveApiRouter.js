const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const upload = require("../config/multer-config");
const usersModel = require("../models/usersModel");
const { cacheHit } = require("../utils/cache");
const File = require("../models/fileModel");

const send = async (res, key, fetcher) => {
  try {
    const data = await cacheHit(key, 60, fetcher);
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

    const suggFolderList = await send(res, folderKey, async () => {
      const folders = await File.find({
        owner: userId,
        type: "folder",
        status: "active",
      })
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean();
      return folders;
    });

    const suggFileList = await send(res, fileKey, async () => {
      const files = await File.find({
        owner: userId,
        type: "file",
        status: "active",
      })
        .sort({ updatedAt: -1 })
        .lean();
      return files;
    });

    const response = { suggFolderList, suggFileList };

    res.json(response);
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
    home: {
      owner: userId,
      status: "active",
    },
    "my-drive": {
      owner: userId,
      parent: folderId || "my-drive",
      label: { $in: ["myDrive", "recent", "starred"] },
      status: "active",
    },
    computers: {
      owner: userId,
      parent: folderId || "my-drive",
      label: "computer",
      status: "active",
    },
    "shared-with-me": {
      owner: userId,
      label: "sharedWithMe",
      status: "active",
    },
    recent: {
      owner: userId,
      label: "recent",
      status: "active",
    },
    starred: {
      owner: userId,
      starred: true,
      label: "starred",
      status: "active",
    },
    spam: {
      owner: userId,
      label: "spam",
      status: "spam",
    },
    bin: {
      owner: userId,
      label: "bin",
      status: "trash",
    },
    storage: {
      owner: userId,
      status: "active",
    },
  };
  try {
    const allUserFiles = await File.find({ owner: userId }).lean();
    if (allUserFiles.length > 0) {
      console.log(
        "📄 Sample files:",
        allUserFiles.slice(0, 5).map((f) => ({
          name: f.name,
          type: f.type,
          label: f.label,
          status: f.status,
          parent: f.parent,
        })),
      );
    }

    const files = await send(res, key, async () => {
      const result = await File.find(query[view] || query["my-drive"])
        .sort(view === "recent" ? { updatedAt: -1 } : { name: 1 })
        .lean();
      return result;
    });
    console.log("✅ Returning", files.length, "files for view:", view);

    res.json(files);
  } catch (err) {
    console.error("Error fetching view data:", err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});
router.get("/search", isLoggedIn, async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);

    const userId = req.session.userId;
    const files = await File.find({
      name: { $regex: query, $options: "i" },
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
