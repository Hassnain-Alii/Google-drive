const { minioClient } = require("../config/minio");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");
const archiver = require("archiver");
const File = require("../models/fileModel");

async function addFileToZip(archive, file, basePath = "") {
  try {
    const command = new GetObjectCommand({
      Bucket: "gdrive-bucket",
      Key: file.s3Key,
    });
    const s3Response = await minioClient.send(command);
    archive.append(s3Response.Body, { name: path.join(basePath, file.name) });
  } catch (error) {
    console.error(`Error adding file ${file.name} to zip:`, error);
  }
}

async function addFolderToZip(archiver, folder, basePath = "") {
  const children = await File.find({ parent: folder._id });
  for (const child of children) {
    if (child.type === "file") {
      await addFileToZip(archiver, child, path.join(basePath, folder.name));
    } else {
      await addFolderToZip(archiver, child, path.join(basePath, folder.name));
    }
  }
}
async function downloadAsZip(res, items, zipName = "download.zip") {
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="${zipName}"`);

  const archive = archiver("zip", {
    zlib: { level: 9 },
  });
  archive.pipe(res);

  for (const item of items) {
    if (item.type === "file") {
      await addFileToZip(archive, item);
    } else {
      await addFolderToZip(archive, item);
    }
  }
  await archive.finalize();
}

module.exports = {
  downloadAsZip,
};
