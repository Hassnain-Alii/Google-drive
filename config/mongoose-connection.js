const mongoose = require("mongoose");
const DB_NAME = "Google-drive-clone";
const dbUrl = process.env.DB_URL;

const connectionString = dbUrl 
  ? (dbUrl.includes("mongodb+srv") ? dbUrl : `${dbUrl}/${DB_NAME}?authSource=admin`)
  : `mongodb://localhost:27017/${DB_NAME}`;

// Mask URL for safe logging
const maskedUrl = connectionString.replace(/\/\/.*:.*@/, "//***:***@");
console.log(`[Mongoose] Attempting connection to: ${maskedUrl}`);

mongoose
  .connect(connectionString, {
    connectTimeoutMS: 10000, // 10 seconds timeout
  })
  .then(() => {
    console.log("✅ [Mongoose] Successfully connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ [Mongoose] Connection Error:", err.message);
  });

module.exports = mongoose.connection;
