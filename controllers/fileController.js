const { GetObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
const { minioClient } = require("../config/minio");
const File = require("../models/fileModel");

const BUCKET_NAME = "gdrive-bucket";

// STREAM FILE FOR PREVIEW
const viewFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) return res.sendStatus(404);

    // FIX: Only stream if it's a file, not a folder or label
    if (file.type !== "file" && !file.isFolder && !file.isLabel) {
      if (file.type === "folder" || file.type === "label") {
        console.warn(
          `Attempted to view non-file item: ${file.name} (${file.type})`,
        );
        return res.status(400).send("Only files can be viewed.");
      }
    }

    if (!file.s3Key) {
      console.error(`Missing s3Key on file: ${file._id}`);
      return res.status(404).send("File not found on storage.");
    }

    try {
      const headResponse = await minioClient.send(
        new HeadObjectCommand({
          Bucket: BUCKET_NAME,
          Key: file.s3Key,
        }),
      );

      const fileSize = headResponse.ContentLength;
      const range = req.headers.range;
      const mimeType =
        file.mimeType || headResponse.ContentType || "application/octet-stream";

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize || end >= fileSize) {
          res
            .status(416)
            .send(`Requested range not satisfiable\n${start}-${end}`);
          return;
        }

        const chunkSize = end - start + 1;

        const getObjectParams = {
          Bucket: BUCKET_NAME,
          Key: file.s3Key,
          Range: `bytes=${start}-${end}`,
        };

        const response = await minioClient.send(
          new GetObjectCommand(getObjectParams),
        );

        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize,
          "Content-Type": mimeType,
        });

        response.Body.pipe(res);
      } else {
        const getObjectParams = {
          Bucket: BUCKET_NAME,
          Key: file.s3Key,
        };

        const response = await minioClient.send(
          new GetObjectCommand(getObjectParams),
        );

        res.writeHead(200, {
          "Content-Length": fileSize,
          "Content-Type": mimeType,
        });

        response.Body.pipe(res);
      }
    } catch (s3Err) {
      console.error(`S3 Error viewing: ${file.s3Key}`, s3Err);
      return res.status(404).send("File not found.");
    }
  } catch (err) {
    console.error("ViewFile Error:", err);
    res.sendStatus(500);
  }
};

// DOWNLOAD FILE
const downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // FIX: Only download if it's a file
    if (file.type !== "file") {
      return res
        .status(400)
        .json({
          error: "Only files can be downloaded directly. Use zip for folders.",
        });
    }

    if (!file.s3Key) {
      return res.status(404).json({ error: "File missing s3Key" });
    }

    try {
      const getObjectParams = {
        Bucket: BUCKET_NAME,
        Key: file.s3Key,
      };

      const response = await minioClient.send(
        new GetObjectCommand(getObjectParams),
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(file.name)}"`,
      );
      res.setHeader(
        "Content-Type",
        file.mimeType || response.ContentType || "application/octet-stream",
      );
      if (response.ContentLength) {
        res.setHeader("Content-Length", response.ContentLength);
      }

      response.Body.pipe(res);
    } catch (s3Err) {
      console.error(`S3 Error downloading: ${file.s3Key}`, s3Err);
      return res.status(404).json({ error: "File missing on server storage" });
    }
  } catch (err) {
    console.error("DownloadFile Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  viewFile,
  downloadFile,
};
