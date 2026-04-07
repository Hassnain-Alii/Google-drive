const mongoose = require("mongoose");
const DB_NAME = "Google-drive-clone";

// 1. Clean and Validate URL
const dbDefault = process.env.DB_URL || "";
let dbUrl = dbDefault.trim().replace(/[\r\n]/gm, "");

// 2. Ensure Database Name is present for Atlas
if (dbUrl && dbUrl.includes(".net/") && !dbUrl.includes(".net/" + DB_NAME)) {
    const parts = dbUrl.split(".net/");
    const queryPart = parts[1].includes("?") ? "?" + parts[1].split("?")[1] : "";
    dbUrl = `${parts[0]}.net/${DB_NAME}${queryPart}`;
}

// 3. Set persistent connection options (Essential for Vercel)
mongoose.set("bufferCommands", false); // Don't buffer commands if connection isn't ready

const options = {
  serverSelectionTimeoutMS: 20000, 
  connectTimeoutMS: 30000, 		   
  socketTimeoutMS: 45000, 		   
  family: 4,						   
  heartbeatFrequencyMS: 30000,     
};

// Initiate connection attempt
mongoose
  .connect(dbUrl || `mongodb://localhost:27017/${DB_NAME}`, options)
  .then(() => {
    console.log("✅ [Mongoose] Connection ACTIVE");
  })
  .catch((err) => {
    console.error("❌ [Mongoose] FAILED:", err.message);
  });

module.exports = mongoose.connection;
