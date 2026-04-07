const usersModel = require("../models/usersModel");
const bcrypt = require("bcrypt");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { storageClient, BUCKET_NAME } = require("../config/supabase");
const { pwnedPassword } = require("hibp");

getSettingsPage = async (req, res) => {
  try {
    res.render("settings", { user: req.user });
  } catch (error) {
    console.error("Error loading settings page:", error.message);
    req.flash("error", "Error loading settings page");
    res.status(500).redirect("/somethingWentWrong");
  }
};

updateSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      firstname,
      lastname,
      email,
      birthDate,
      gender,
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    const updateData = {
      firstname,
      lastname,
      email,
      gender,
    };

    if (birthDate) {
      updateData.birthDate = new Date(birthDate);
    }

    // Handle profile image upload
    if (req.file) {
      updateData.profileImg = req.file.key; // Store the S3 key
    }

    // Handle password change if requested
    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        req.flash("error", "Current, new, and confirm password must all be filled to change password");
        return res.redirect("/settings");
      }

      if (newPassword !== confirmPassword) {
        req.flash("error", "New password and confirmation do not match");
        return res.redirect("/settings");
      }

      if (newPassword.length < 8) {
        req.flash("error", "Use 8 characters or more for your new password");
        return res.redirect("/settings");
      }

      const breachCount = await pwnedPassword(newPassword);
      if (breachCount > 0) {
        req.flash("error", "This password has appeared in data breaches – choose another");
        return res.redirect("/settings");
      }

      const user = await usersModel.findById(userId);
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        req.flash("error", "Current password does not match");
        return res.redirect("/settings");
      }

      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(newPassword, salt);
    }

    await usersModel.findByIdAndUpdate(userId, updateData);

    req.flash("success", "Profile updated successfully");
    res.redirect("/settings");
  } catch (error) {
    console.error("Error updating settings:", error.message);
    req.flash("error", "Failed to update settings: " + error.message);
    res.status(500).redirect("/settings");
  }
};

serveProfileImage = async (req, res) => {
  try {
    const user = await usersModel.findById(req.params.userId);
    if (!user || !user.profileImg) {
      return res.redirect("/images/user.png");
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: user.profileImg,
    });

    const s3Response = await storageClient.send(command);
    res.setHeader("Content-Type", s3Response.ContentType || "image/jpeg");
    s3Response.Body.pipe(res);
  } catch (error) {
    console.error("Error serving profile image:", error.message);
    res.redirect("/images/Default-User.png");
  }
};

module.exports = {
  getSettingsPage,
  updateSettings,
  serveProfileImage,
};
