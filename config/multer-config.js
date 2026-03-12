const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, "uploads/"),
  filename: (_, file, cb) => {
    const uniq = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${path.parse(file.originalname).name}-${uniq}${path.extname(
        file.originalname
      )}`
    );
  },
});

const upload = multer({ storage });

module.exports = upload;
