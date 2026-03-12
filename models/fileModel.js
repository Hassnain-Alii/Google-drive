const mongoose = require("mongoose");

const LABELS = [
  "myDrive",
  "computer",
  "sharedWithMe",
  "recent",
  "starred",
  "spam",
  "bin",
];

const fileSchema = new mongoose.Schema({
  /*  WHO  */
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  /*  WHAT  */
  name: { type: String, required: true },
  type: { type: String, enum: ["file", "folder", "label"], required: true },

  /*  MIME & BYTES  (only if type === 'file')  */
  mimeType: { type: String, default: "application/octet-stream" },
  size: { type: Number, default: 0 },
  checksum: { type: String },

  /*  WHERE  */
  parent: {
    type: String,
    ref: "File",
    default: "my-drive",
  },
  path: { type: String, default: "/" },

  /*  GOOGLE-LABEL  (only if type === 'label')  */
  label: { type: String, enum: LABELS },

  /*  GOOGLE-DRIVE STATES  */
  status: {
    type: String,
    enum: ["active", "trash", "spam", "deleted"],
    default: "active",
  },
  starred: { type: Boolean, default: false },
  shared: { type: Boolean, default: false },
  trashedAt: { type: Date },
  deletedAt: { type: Date },
  originalLabel: { type: String }, // Store original label before trashing for restoration

  /*  STORAGE  */
  storageUrl: { type: String },
  thumbUrl: { type: String },

  /*  METADATA  */
  version: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  // links to MinIO object
  s3Key: { type: String },
});

fileSchema.virtual("isFolder").get(function () {
  return this.type === "folder";
});
fileSchema.virtual("isFile").get(function () {
  return this.type === "file";
});
fileSchema.virtual("isLabel").get(function () {
  return this.type === "label";
});
fileSchema.virtual("isTrashed").get(function () {
  return this.status === "trash";
});
fileSchema.virtual("isSpam").get(function () {
  return this.status === "spam";
});
fileSchema.virtual("ownerInfo", {
  ref: "user",
  localField: "owner",
  foreignField: "_id",
  justOne: true,
});

fileSchema.set("toJSON", { virtuals: true });
fileSchema.set("toObject", { virtuals: true });

fileSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("File", fileSchema);
