const express = require("express");
const router = express.Router();

const { viewFile, downloadFile } = require("../controllers/fileController");
const isLoggedIn = require("../middlewares/isLoggedIn");

// preview / streaming
router.get("/:id/view", isLoggedIn, viewFile);

// download
router.get("/:id/download", isLoggedIn, downloadFile);

module.exports = router;
