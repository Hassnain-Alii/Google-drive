const express = require("express");
const router = express.Router();
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { minioClient } = require("../config/minio");
const { downloadAsZip } = require("../services/downloadService");
const File = require("../models/fileModel");

const fs = require("fs");
const path = require("path");

router.get("/file/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file || file.type !== "file" || !file.s3Key) {
      return res.status(404).json({ error: "File not found" });
    }

    const command = new GetObjectCommand({
      Bucket: "gdrive-bucket",
      Key: file.s3Key,
    });

    const s3Response = await minioClient.send(command);

    res.setHeader("Content-Type", file.mimeType || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);
    if (file.size) {
      res.setHeader("Content-Length", file.size);
    }

    s3Response.Body.pipe(res);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Download failed" });
  }
});

router.get("/folder/:id", async (req, res) => {
  try {
    const folder = await File.findById(req.params.id);
    if (!folder || folder.type !== "folder") {
      return res.status(404).json({ error: "Folder not found" });
    }
    await downloadAsZip(res, [folder], `${folder.name}.zip`);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Folder not found (download route)" });
  }
});

router.post("/bulk", async (req, res) => {
  try {
    let { ids } = req.body;
    if (typeof ids === "string") {
      try {
        ids = JSON.parse(ids);
      } catch (e) {
        return res.status(400).json({ error: "Invalid IDs format" });
      }
    }

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: "Invalid files array" });
    }
    const files = await File.find({ _id: { $in: ids } });
    if (files.length === 0) {
      return res.status(404).json({ error: "No files found" });
    }
    await downloadAsZip(res, files, "bulk-download.zip");
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ error: "Failed to download files (bulk download route)" });
  }
});

module.exports = router;
