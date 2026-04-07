const mongoose = require("mongoose");
const DB_NAME = "Google-drive-clone";

// 1. URL Preparation
const dbDefault = process.env.DB_URL || "";
let dbUrl = dbDefault.trim().replace(/[\r\n]/gm, "");

if (dbUrl && dbUrl.includes(".net/") && !dbUrl.includes(".net/" + DB_NAME)) {
    const parts = dbUrl.split(".net/");
    const queryPart = parts[1].includes("?") ? "?" + parts[1].split("?")[1] : "";
    dbUrl = `${parts[0]}.net/${DB_NAME}${queryPart}`;
}

const connectionUrl = dbUrl || `mongodb://localhost:27017/${DB_NAME}`;

// 2. Global cached connection for Serverless
let cachedConnection = null;

const connectDB = async () => {
  // If we already have a connection, reuse it
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If we are currently connecting, wait for it
  if (mongoose.connection.readyState === 2) {
      console.log("⏳ [Mongoose] Connection busy, waiting...");
      return new Promise((resolve) => {
          mongoose.connection.once("connected", () => resolve(mongoose.connection));
      });
  }

  console.log("🔋 [Mongoose] New connection attempt starting...");
  
  try {
    const opts = {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4, 
      bufferCommands: false
    };

    await mongoose.connect(connectionUrl, opts);
    console.log("✅ [Mongoose] Connection ESTABLISHED");
    return mongoose.connection;
  } catch (err) {
    console.error("❌ [Mongoose] FATAL ERROR:", err.message);
    throw err;
  }
};

// Export the connector
module.exports = { connectDB, connection: mongoose.connection };
