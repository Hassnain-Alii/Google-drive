const File = require("../models/fileModel");
const { invalidateCache } = require("./cache");

function getCopyName(originalName) {
  // Separate extension from name
  const ext = originalName.includes(".")
    ? originalName.slice(originalName.lastIndexOf("."))
    : "";
  const name = ext
    ? originalName.slice(0, originalName.lastIndexOf("."))
    : originalName;

  // Check if it already starts with "Copy of"
  if (name.startsWith("Copy of ")) {
    // Check if there's already a counter like (2), (3), etc.
    const match = name.match(/ \((\d+)\)$/);
    if (match) {
      // Extract the number, increment it, and replace
      const currentCount = parseInt(match[1], 10);
      const newCount = currentCount + 1;
      const baseName = name.replace(/ \(\d+\)$/, ""); // Remove old counter
      return `${baseName} (${newCount})${ext}`;
    }
    // No counter yet, add (2)
    return `${name} (2)${ext}`;
  }

  // First copy, add "Copy of" prefix
  return `Copy of ${originalName}`;
}

async function copyFolderRecursive(folder, userId, newParent = folder.parent) {
  const newFolder = new File({
    name: getCopyName(folder.name),
    parent: newParent,
    type: "folder",
    status: "active",
    owner: userId,
    label: "myDrive",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await newFolder.save();

  const children = await File.find({ parent: folder._id });

  for (const child of children) {
    if (child.type === "folder") {
      await copyFolderRecursive(child, userId, newFolder._id);
    } else {
      const copyFile = new File({
        name: child.name,
        parent: newFolder._id,
        mimeType: child.mimeType,
        s3Key: child.s3Key,
        size: child.size,
        type: "file",
        status: "active",
        owner: userId,
        label: "myDrive",
        starred: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await copyFile.save();
      await invalidateCache(userId);
    }
  }
  return newFolder;
}

module.exports = {
  getCopyName,
  copyFolderRecursive,
};
