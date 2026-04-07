const express = require("express");
const router = express.Router();
const isLoggedin = require("../middlewares/isLoggedIn");

const usersModel = require("../models/usersModel");

router.get("/", function (req, res) {
  try {
    // If user is already logged in, redirect to home
    if (req.session && req.session.userId) {
      return res.redirect("/drive/home");
    }
    res.render("loginPages/loginEmail", {});
  } catch (error) {
    res.render("loginPages/loginEmail", {});
  }
});
router.get("/sessionEnded", function (req, res) {
  try {
    res.render("errors/sessionEnded");
  } catch (error) {
    console.log(error.message);
  }
});
router.get("/somethingWentWrong", function (req, res) {
  try {
    res.render("errors/somethingWentWrong");
  } catch (error) {
    console.log(error.message);
  }
});

module.exports = router;
