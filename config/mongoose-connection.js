const mongoose = require("mongoose");
const debug = require("debug")("development:mongoose");
const config = require("config");

const DB_NAME = "Google-drive-clone";
const dbUrl = process.env.DB_URL || config.get("DB_URL") || "mongodb://localhost:27017";

mongoose
  .connect(`${dbUrl}/${DB_NAME}?authSource=admin`)
  .then(() => {
    debug("Connected to MongoDB");
  })
  .catch((err) => {
    debug(`Error connecting to MongoDB: ${err.message}`);
  });
console.log(`[Mongoose] About to connect to: ${dbUrl}/${DB_NAME}`);
module.exports = mongoose.connection;
