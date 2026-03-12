const mongoose = require("mongoose");
const debug = require("debug")("development:mongoose");
const config = require("config");

const DB_NAME = "Google-drive-clone";
mongoose
  .connect(`${config.get("DB_URL")}/${DB_NAME}?authSource=admin`)
  .then(() => {
    debug("Connected to MongoDB");
  })
  .catch((err) => {
    debug("Error connecting to MongoDB:", err.message);
  });
console.log(
  "[Mongoose] About to connect to:",
  config.get("DB_URL") + "/Google-drive-clone"
);
module.exports = mongoose.connection;
