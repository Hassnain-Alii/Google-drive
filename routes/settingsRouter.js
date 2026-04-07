const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const { upload } = require("../config/supabase");
const {
  getSettingsPage,
  updateSettings,
  serveProfileImage,
} = require("../controllers/userSettingsController");

router.get("/", isLoggedIn, getSettingsPage);
router.post("/update", isLoggedIn, upload.single("profileImg"), updateSettings);
router.get("/image/:userId", serveProfileImage);

module.exports = router;
