const mongoose = require("mongoose");
const DB_NAME = "Google-drive-clone";
const dbUrl = process.env.DB_URL;

const connectionString = dbUrl 
  ? (dbUrl.includes("mongodb+srv") ? dbUrl : `${dbUrl}/${DB_NAME}?authSource=admin`)
  : `mongodb://localhost:27017/${DB_NAME}`;

// Mask URL for safe logging
const maskedUrl = connectionString.replace(/\/\/.*:.*@/, "//***:***@");
console.log(`[Mongoose] Attempting connection to: ${maskedUrl}`);

// Disable buffering so we see the REAL connection error immediately
mongoose.set("bufferCommands", false);

mongoose
  .connect(connectionString, {
    serverSelectionTimeoutMS: 5000, // Fail after 5 seconds instead of 10
    connectTimeoutMS: 10000,
  })
  .then(() => {
    console.log("✅ [Mongoose] Successfully connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ [Mongoose] Connection Error:", err.message);
  });

module.exports = mongoose.connection;
