const mongoose = require("mongoose");
const debug = require("debug")("development:mongoose");
const config = require("config");

const DB_NAME = "Google-drive-clone";
const dbUrl = process.env.DB_URL;

const connectionString = dbUrl 
  ? (dbUrl.includes("mongodb+srv") ? dbUrl : `${dbUrl}/${DB_NAME}?authSource=admin`)
  : `mongodb://localhost:27017/${DB_NAME}`;

mongoose
  .connect(connectionString)
  .then(() => {
    debug("Connected to MongoDB");
  })
  .catch((err) => {
    debug(`Error connecting to MongoDB: ${err.message}`);
  });
console.log(`[Mongoose] Connecting to database...`);
module.exports = mongoose.connection;
