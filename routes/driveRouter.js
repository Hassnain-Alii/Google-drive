const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const upload = require("../config/multer-config");
const usersModel = require("../models/usersModel");
const { cacheHit, invalidateCache } = require("../utils/cache");
const File = require("../models/fileModel");
const { storageClient, BUCKET_NAME, DeleteObjectCommand } = require("../config/supabase");
const { getCopyName, copyFolderRecursive } = require("../utils/copyUtils");

router.get("/home", isLoggedIn, async (req, res) => {
  try {
    res.render("home", { currentFolder: null, path: req.originalUrl });
  } catch (error) {
    console.log(error.message);
  }
});
// Helper to get breadcrumbs
async function getBreadcrumbs(folderId) {
  const crumbs = [];
  let current = await File.findById(folderId);
  while (current) {
    crumbs.unshift({ name: current.name, _id: current._id });
    if (!current.parent || current.parent === "my-drive" || current.parent === "null") break;
    current = await File.findById(current.parent);
  }
  return crumbs;
}

router.get("/my-drive", isLoggedIn, async (req, res) => {
  try {
    res.render("myDrive", {
      currentFolder: null,
      path: req.originalUrl,
      breadcrumbs: [],
    });
  } catch (error) {
    console.log(error.message);
  }
});

router.get("/driveHub", isLoggedIn, async (req, res) => {
  try {
    res.render("driveHub", { currentFolder: null, path: req.originalUrl });
  } catch (error) {
    console.log(error.message);
  }
});
router.get("/computers", isLoggedIn, async (req, res) => {
  try {
    res.render("computers", { currentFolder: null, path: req.originalUrl });
  } catch (error) {
    console.log(error.message);
  }
});
router.get("/shared-with-me", isLoggedIn, async (req, res) => {
  try {
    res.render("sharedWithMe", { currentFolder: null, path: req.originalUrl });
  } catch (error) {
    console.log(error.message);
  }
});
router.get("/recent", isLoggedIn, async (req, res) => {
  try {
    res.render("recent", { currentFolder: null, path: req.originalUrl });
  } catch (error) {
    console.log(error.message);
  }
});
router.get("/starred", isLoggedIn, async (req, res) => {
  try {
    res.render("starred", { currentFolder: null, path: req.originalUrl });
  } catch (error) {
    console.log(error.message);
  }
});
router.get("/spam", isLoggedIn, async (req, res) => {
  try {
    res.render("spam", { currentFolder: null, path: req.originalUrl });
  } catch (error) {
    console.log(error.message);
  }
});
router.get("/bin", isLoggedIn, async (req, res) => {
  try {
    res.render("bin", { currentFolder: null, path: req.originalUrl });
  } catch (error) {
    console.log(error.message);
  }
});
router.get("/storage", isLoggedIn, async (req, res) => {
  try {
    res.render("storage", { currentFolder: null, path: req.originalUrl });
  } catch (error) {
    console.log(error.message);
  }
});

router.get("/my-drive/folder/:folderId", isLoggedIn, async (req, res) => {
  try {
    const folderId = req.params.folderId;
    const currentFolder = await File.findById(folderId);
    await File.findByIdAndUpdate(folderId, {
      label: "recent",
      updatedAt: new Date(),
    });

    if (!currentFolder) {
      return res.redirect("/drive/my-drive");
    }

    const breadcrumbs = await getBreadcrumbs(folderId);

    res.render("myDrive", {
      currentFolder: currentFolder,
      path: req.originalUrl,
      breadcrumbs: breadcrumbs,
    });
  } catch (error) {
    console.log(error.message);
    res.redirect("/drive/my-drive");
  }
});
router.post("/starred/:id", isLoggedIn, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });

    const newStarred = !file.starred;

    // Update starred status and label
    await File.findByIdAndUpdate(req.params.id, {
      starred: newStarred,
      label: newStarred ? "starred" : "myDrive", // When starred, label is 'starred'. When unstarred, label is 'myDrive'
    });

    await invalidateCache(req.user._id);
    res.json({ success: true, starred: newStarred });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to update starred status" });
  }
});
router.post("/trash/:id", isLoggedIn, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });

    // Save original label before trashing
    await File.findByIdAndUpdate(req.params.id, {
      status: "trash",
      originalLabel: file.label, // Preserve original label
      label: "bin",
      trashedAt: new Date(),
    });
    await invalidateCache(req.user._id);
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
  }
});
router.post("/restore/:id", isLoggedIn, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });

    // Restore to original label, or default to myDrive if no original label
    const restoreLabel = file.originalLabel || "myDrive";

    await File.findByIdAndUpdate(req.params.id, {
      status: "active",
      label: restoreLabel, // Restore to original location
      trashedAt: null,
      originalLabel: null, // Clear the saved original label
    });
    await invalidateCache(req.user._id);
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
  }
});
router.delete("/delete-forever/:id", isLoggedIn, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });

    const command = new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: file.s3Key });
    await storageClient.send(command);

    await File.findByIdAndDelete(req.params.id);

    await invalidateCache(req.user._id);

    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
  }
});

router.post("/create-folder", isLoggedIn, async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { name, parent } = req.body;
    const userId = req.user._id;

    const folder = await File.create({
      name,
      parent: parent || "my-drive",
      type: "folder",
      status: "active",
      owner: userId,
      label: "myDrive", // ← IMPORTANT: This makes it show in My Drive!
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Clear cache so user sees the new folder immediately
    await invalidateCache(userId);

    res.json({ success: true, folder: folder });
  } catch (error) {
    console.error("Create folder error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/download/:id", isLoggedIn, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });

    await File.findByIdAndUpdate(req.params.id, {
      label: "recent",
      updatedAt: new Date(),
    });
    await invalidateCache(req.user._id);
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
  }
});
router.post("/rename/:id", isLoggedIn, async (req, res) => {
  try {
    await File.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
    });
    await invalidateCache(req.user._id);
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
  }
});
router.post("/copy/:id", isLoggedIn, async (req, res) => {
  try {
    const originalId = req.params.id;
    const userId = req.session.userId;
    const original = await File.findById(originalId);
    if (!original || original.owner.toString() !== userId) {
      return res.status(404).json({ error: "Original file not found" });
    }
    if (original.type === "folder") {
      const newFolder = await copyFolderRecursive(original, userId);
      await invalidateCache(userId);
      return res.json({ success: true, folder: newFolder });
    }

    const copy = new File({
      name: getCopyName(original.name),
      parent: original.parent || "my-drive",
      type: "file",
      status: "active",
      owner: userId,
      label: original.label,
      s3Key: original.s3Key,
      size: original.size,
      mimeType: original.mimeType,
      starred: original.starred,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await copy.save();
    await invalidateCache(req.user._id);
    res.json({ success: true, newFile: copy });
  } catch (error) {
    console.error("Copy failed:", error);
    res.status(500).json({ error: "Copy failed" });
  }
});

module.exports = router;
