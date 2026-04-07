const usersModel = require("../models/usersModel");
const bcrypt = require("bcrypt");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { storageClient, BUCKET_NAME } = require("../config/supabase");


const getSettingsPage = async (req, res) => {
  try {
    res.render("settings", { user: req.user });
  } catch (error) {
    console.error("❌ Error rendering settings page:", error);
    res.status(500).redirect("/somethingWentWrong");
  }
};

const updateSettings = async (req, res) => {
  try {
    if (!req.user) throw new Error("Not authenticated");
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

    const updateData = { firstname, lastname, email, gender };

    if (birthDate) updateData.birthDate = new Date(birthDate);
    if (req.file) updateData.profileImg = req.file.key;

    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        req.flash("error", "All password fields are required to change password");
        return res.redirect("/settings");
      }

      if (newPassword !== confirmPassword) {
        req.flash("error", "Passwords do not match");
        return res.redirect("/settings");
      }

      const user = await usersModel.findById(userId);
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        req.flash("error", "Current password is incorrect");
        return res.redirect("/settings");
      }

      const salt = await bcrypt.genSalt(12);
      updateData.password = await bcrypt.hash(newPassword, salt);
    }

    await usersModel.findByIdAndUpdate(userId, updateData);
    req.flash("success", "Profile updated successfully");
    res.redirect("/settings");
  } catch (error) {
    console.error("❌ Error updating settings:", error);
    req.flash("error", "Update failed: " + error.message);
    res.status(500).redirect("/settings");
  }
};

const serveProfileImage = async (req, res) => {
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
    console.error("❌ Error serving profile image:", error.message);
    res.redirect("/images/Default-User.png");
  }
};

module.exports = {
  getSettingsPage,
  updateSettings,
  serveProfileImage,
};
