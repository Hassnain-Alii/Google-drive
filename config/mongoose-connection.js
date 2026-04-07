const mongoose = require("mongoose");
const DB_NAME = "Google-drive-clone";

// 1. Log environment visibility
const envKeys = Object.keys(process.env).filter(k => k.includes("DB") || k.includes("URL"));
console.log(`[Mongoose] Env Check: Available Keys = [${envKeys.join(", ")}]`);

// 2. Clean and Validate URL
let dbUrl = (process.env.DB_URL || "").trim().replace(/[\r\n]/gm, "");

if (!dbUrl && process.env.NODE_ENV === "production") {
  console.error("❌ CRITICAL: DB_URL is completely missing from Vercel environment variables!");
}

// 3. Ensure Database Name is present in the string
// If the URL doesn't have a database name after the .net/, add it.
if (dbUrl && dbUrl.includes(".net/") && !dbUrl.includes(".net/" + DB_NAME)) {
    const parts = dbUrl.split(".net/");
    const queryPart = parts[1].includes("?") ? "?" + parts[1].split("?")[1] : "";
    dbUrl = `${parts[0]}.net/${DB_NAME}${queryPart}`;
}

const maskedUrl = dbUrl.replace(/\/\/.*:.*@/, "//***:***@");
console.log(`[Mongoose] Connecting to: ${maskedUrl}`);

// 4. Set persistent connection options
mongoose.set("bufferCommands", true);

const options = {
  serverSelectionTimeoutMS: 20000, // 20s
  connectTimeoutMS: 30000, 		   // 30s
  socketTimeoutMS: 45000, 		   // 45s
  family: 4						   // Force IPv4
};

mongoose
  .connect(dbUrl || `mongodb://localhost:27017/${DB_NAME}`, options)
  .then(() => {
    console.log("✅ [Mongoose] Successfully connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.error("❌ [Mongoose] CONNECTION FAILED:", err.message);
  });

module.exports = mongoose.connection;
