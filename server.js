require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

const compression = require("compression");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const helmet = require("helmet");
const hpp = require("hpp");
const morgan = require("morgan");
const session = require("express-session");
const flash = require("connect-flash");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcrypt");

const { client, redis } = require("./config/redis");
const RedisStore = require("connect-redis")(session);
const RLRedisStore = require("rate-limit-redis").default;

const logger = require("./utils/logger");
const DB_URL = require("./config/mongoose-connection");
const File = require("./models/fileModel");
const { storageClient, BUCKET_NAME, DeleteObjectCommand } = require("./config/supabase");

const indexRouter = require("./routes/indexRouter");
const driveRouter = require("./routes/driveRouter");
const driveApiRouter = require("./routes/driveApiRouter");
const usersRouter = require("./routes/usersRouter");
const uploadRouter = require("./routes/upload");
const downloadRouter = require("./routes/downloadRouter");
const settingsRouter = require("./routes/settingsRouter");
const fileRoutes = require("./routes/fileRoutes");

const { copyFolderRecursive } = require("./utils/copyUtils");



app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "unpkg.com",
          "https://unpkg.com",
          "https://www.googletagmanager.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "unpkg.com",
          "https://unpkg.com",
          "https://fonts.googleapis.com",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https://ssl.gstatic.com",
          "https://www.gstatic.com",
          "https://unpkg.com",
          "https://lh3.googleusercontent.com",
        ],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  }),
);
app.use(hpp());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// Global Rate Limiting
const globalLimiter = rateLimit({
  store: new RLRedisStore({
    sendCommand: (...args) => client.sendCommand(args),
    prefix: "rl:global:",
  }),
  windowMs: 15 * 60 * 1000,
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(globalLimiter);

app.use(cookieParser());

async function clearOldTrash() {
  setInterval(
    async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const oldTrash = await File.find({
        status: "trash",
        trashedAt: { $lt: thirtyDaysAgo },
      });
      for (const file of oldTrash) {
        if (file.s3Key) {
          const command = new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: file.s3Key });
          await storageClient.send(command);
        }
        await File.findByIdAndDelete(file._id);
        console.log(`Auto-Deleted file: ${file.name}`);
      }
    },
    24 * 60 * 60 * 1000,
  );
}
app.use(morgan("dev"));
app.use(compression());

app.use(express.static(path.join(__dirname, "public"), {
  maxAge: "7d",         // browser caches JS/CSS/images for 7 days
  etag: true,           // enables conditional requests (304 Not Modified)
  lastModified: true,
}));
app.set("view engine", "ejs");
app.set("trust proxy", 1);

app.use(
  session({
    store: new RedisStore({
      client: redis,
      ttl: 1800, // 30 minutes in seconds (must match cookie maxAge)
      disableTouch: false, // Allow session touch to update expiry
    }),
    resave: true, // MUST be true for rolling sessions to work properly
    saveUninitialized: false,
    rolling: true, // Reset session expiry on each request (keeps session alive while active)
    secret: process.env.SESSION_SECRET,
    name: "sid", // don't leak "connect.sid"
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // blocks cross-site POST
      maxAge: 1000 * 60 * 60, // 60 minutes
    },
  }),
);

app.use(flash());
clearOldTrash();

// Use cookie-based CSRF for better stability on Vercel
app.use(csrf({ 
  cookie: {
    key: "_csrf",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  }
}));

app.use((req, res, next) => {
  try {
    res.locals.csrfToken = req.csrfToken();
  } catch (err) {
    res.locals.csrfToken = "";
    console.warn("CSRF token generation failed:", err.message);
  }
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use("/", indexRouter);
app.use("/drive", driveRouter);
app.use("/drive/api", driveApiRouter);
app.use("/users", usersRouter);
app.use("/download", downloadRouter);
app.use("/upload", uploadRouter);
app.use("/settings", settingsRouter);
app.use("/drive/api/files", fileRoutes);

// Detailed Error Handler
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({ 
      errors: { generic: "Session expired or invalid token. Please refresh the page." } 
    });
  }
  
  console.error("Express Error:", err.stack);
  
  // Return JSON for AJAX, or render error page for navigation
  if (req.xhr || (req.headers.accept && req.headers.accept.includes("json"))) {
    return res.status(500).json({ 
      errors: { generic: "Server Error: " + err.message } 
    });
  }
  
  res.status(500).render("errors/somethingWentWrong", { 
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "" : err.stack
  });
});

console.log("Environment:", process.env.NODE_ENV);

const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
