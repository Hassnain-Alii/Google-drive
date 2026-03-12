const express = require("express");
const router = express.Router();
const isLoggedin = require("../middlewares/isLoggedIn");

const usersModel = require("../models/usersModel");

router.get("/", function (req, res) {
  try {
    res.render("loginPages/loginEmail", {});
  } catch (error) {
    console.log("error in /", error.message);
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
