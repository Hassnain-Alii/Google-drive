const { minioClient } = require("../config/minio");
const { HeadBucketCommand } = require("@aws-sdk/client-s3");

async function verifyBucket() {
  const BUCKET_NAME = "gdrive-bucket";
  try {
    await minioClient.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
    console.log(`VERIFICATION SUCCESS: Bucket "${BUCKET_NAME}" exists.`);
    process.exit(0);
  } catch (err) {
    console.error(
      `VERIFICATION FAILED: Bucket "${BUCKET_NAME}" does not exist or error occurred: ${err.message}`,
    );
    process.exit(1);
  }
}

// Small delay to allow ensureBucket() in minio.js to run if it's already triggered by imports
setTimeout(verifyBucket, 2000);
