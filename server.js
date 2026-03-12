const express = require("express");
const app = express();

const dotenv = require("dotenv");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const helmet = require("helmet");
const httpHttps = require("http-https");
const morgan = require("morgan");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const flash = require("connect-flash");
const path = require("path");
const tippy = require("tippy.js");
const https = require("https");
const fs = require("fs");
const { client, redis } = require("./config/redis");
const bcrypt = require("bcrypt");

const indexRouter = require("./routes/indexRouter");
const driveRouter = require("./routes/driveRouter");
const driveApiRouter = require("./routes/driveApiRouter");
const usersRouter = require("./routes/usersRouter");
const uploadRouter = require("./routes/upload");
const downloadRouter = require("./routes/downloadRouter");
const settingsRouter = require("./routes/settingsRouter");
const fileRoutes = require("./routes/fileRoutes");

const { copyFolderRecursive } = require("./utils/copyUtils");

dotenv.config(); // must run before any code that uses process.env
const DB_URL = require("./config/mongoose-connection");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
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
          await minioClient.removeObject("gdrive-bucket", file.s3Key);
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

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

async function startServer() {
  try {
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
          httpOnly: false, // already done ✔
          secure: false, // HTTPS only in prod
          // secure: process.env.NODE_ENV === "development", // HTTPS only in prod
          sameSite: "lax", // blocks cross-site POST
          maxAge: 1000 * 60 * 60, // 30 minutes - will reset on each request due to rolling: true
        },
      }),
    );

    app.use(flash());
    clearOldTrash();

    app.use(csrf({ cookie: false }));
    app.use((req, res, next) => {
      res.locals.csrfToken = req.csrfToken();
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

    console.log(process.env.NODE_ENV);

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, "0.0.0.0", () => console.log(`Server on ${PORT}`));
  } catch (error) {
    console.error("Error", error.message);
    process.exit(1);
  }
}

startServer();
