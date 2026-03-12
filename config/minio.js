const {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
} = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config();

const minioClient = new S3Client({
  region: process.env.MINIO_REGION || "us-east-1",
  endpoint: process.env.MINIO_ENDPOINT,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY,
  },
  forcePathStyle: true,
});

const BUCKET_NAME = "gdrive-bucket";

async function ensureBucket() {
  try {
    await minioClient.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
    console.log(`Bucket "${BUCKET_NAME}" already exists.`);
  } catch (err) {
    if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
      console.log(`Bucket "${BUCKET_NAME}" not found. Creating...`);
      try {
        await minioClient.send(
          new CreateBucketCommand({ Bucket: BUCKET_NAME }),
        );
        console.log(`Bucket "${BUCKET_NAME}" created successfully.`);
      } catch (createErr) {
        console.error(`Error creating bucket: ${createErr.message}`);
      }
    } else {
      console.error(`Error checking bucket: ${err.message}`);
    }
  }
}

// Ensure bucket exists on startup
// Ensure bucket exists on startup
ensureBucket();

const s3Storage = multerS3({
  s3: minioClient,
  bucket: "gdrive-bucket",
  metadata: (req, file, cb) => {
    cb(null, {
      originalName: file.originalname,
      mimeType: file.mimetype,
      owner: req.session.userId,
    });
  },
  key: (req, file, cb) => {
    crypto.randomBytes(16, (err, buf) => {
      if (err) return cb(err);
      const name = buf.toString("hex");
      const date = Date.now();
      const ext = path.extname(file.originalname);
      const filename = `${name}-${date}${ext}`;
      cb(null, filename);
    });
  },
});
const upload = multer({ storage: s3Storage });

module.exports = { minioClient, upload };
