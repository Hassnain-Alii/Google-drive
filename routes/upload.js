const express = require("express");
const router = express.Router();
const { upload } = require("../config/minio");
const {
  createFileDoc,
  createFolderDoc,
  inFolderFiles,
  computeChecksum,
} = require("../services/uploadService");
const isLoggedIn = require("../middlewares/isLoggedIn");
const { invalidateCache } = require("../utils/cache");

router.post("/file", isLoggedIn, (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      console.error("Multer file upload error:", err);
      return res.status(500).json({ error: err.message || "File upload failed in multer" });
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file provided" });
  console.log("Uploaded file info:", req.file);
  const userId = req.session.userId;
  console.log("UserId from session:", userId);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const checksum = await computeChecksum(req.file.key);

  const doc = await createFileDoc({
    userId: req.session.userId,
    parentId: req.body.parent || "my-drive",
    size: req.file.size,
    mimeType: req.file.mimetype,
    originalname: req.file.originalname,
    s3Key: req.file.key,
    checksum,
  });
  console.log("Uploaded file doc:", doc);

  // Invalidate cache so the file appears immediately
  await invalidateCache(req.session.userId);

  res.json({
    message: "File uploaded successfully",
    file: doc.toObject ? doc.toObject() : doc,
  });
});
router.post(
  "/folder",
  isLoggedIn,
  (req, res, next) => {
    upload.array("folderFiles")(req, res, (err) => {
      if (err) {
        console.error("Multer folder upload error:", err);
        return res.status(500).json({ error: err.message || "Folder upload failed in multer" });
      }
      next();
    });
  },
  async (req, res) => {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: "No folder provided" });
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const root = await createFolderDoc({
      userId: req.session.userId,
      name: req.body.folderName,
      parentId: req.body.parent || "my-drive",
    });
    await inFolderFiles({
      files: req.files,
      rootId: root._id,
      userId: req.session.userId,
    });

    // Invalidate cache so the folder appears immediately
    await invalidateCache(req.session.userId);

    res.json({
      message: "Folder uploaded successfully",
      folder: root.toObject ? root.toObject() : root,
    });
  },
);
module.exports = router;
