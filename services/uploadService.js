const fileModel = require("../models/fileModel");
const path = require("path");
const crypto = require("crypto");
const { minioClient } = require("../config/minio");
const { GetObjectCommand } = require("@aws-sdk/client-s3");

async function createFileDoc(data) {
  const name = path.basename(data.originalname);

  const file = await fileModel.create({
    owner: data.userId,
    name: name,
    type: "file",
    mimeType: data.mimeType,
    size: data.size,
    s3Key: data.s3Key,
    checksum: data.checksum,
    parent: data.parentId,
    storageUrl: `/download/${data.s3Key}`,
    label: "myDrive",
    status: "active",
  });
  return file;
}

async function createFolderDoc(data) {
  const folder = await fileModel.create({
    owner: data.userId,
    name: data.name,
    type: "folder",
    parent: data.parentId,
    label: "myDrive",
    status: "active",
  });
  return folder;
}

async function computeChecksum(s3Key) {
  const command = new GetObjectCommand({
    Bucket: "gdrive-bucket",
    Key: s3Key,
  });
  const { Body } = await minioClient.send(command);
  const hash = crypto.createHash("sha256");
  return new Promise((resolve, reject) => {
    Body.on("data", (chunk) => hash.update(chunk));
    Body.on("end", () => resolve(hash.digest("hex")));
    Body.on("error", (err) => reject(err));
  });
}
async function inFolderFiles({ files, rootId, userId }) {
  const pathMap = new Map();
  files.forEach((file) => pathMap.set(file.originalname, file));

  const sorted = Array.from(pathMap.keys()).sort();
  const folderCache = new Map();

  for (const rel of sorted) {
    const file = pathMap.get(rel);
    const dir = path.dirname(rel);
    let parentId = rootId;

    if (dir !== ".") {
      const parts = dir.split(path.sep);
      let current = "";
      for (const p of parts) {
        current = current ? `${current}/${p}` : p;
        if (!folderCache.has(current)) {
          const parent =
            folderCache.get(current.split("/").slice(0, -1).join("/") || ".") ||
            rootId;
          const doc = await createFolderDoc({
            userId,
            name: p,
            parentId: parent,
          });
          folderCache.set(current, doc._id);
        }
        parentId = folderCache.get(current);
      }
    }
    const checksum = await computeChecksum(file.key);
    await createFileDoc({
      userId,
      parentId,
      checksum,
      originalname: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      s3Key: file.key,
    });
  }
}
module.exports = {
  createFileDoc,
  createFolderDoc,
  inFolderFiles,
  computeChecksum,
};
