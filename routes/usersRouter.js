const express = require("express");
const { get } = require("http-https");
const router = express.Router();
const isLoggedin = require("../middlewares/isLoggedIn");
const upload = require("../config/multer-config");
const bycrypt = require("bcrypt");
const { requireStep } = require("../middlewares/authStep");

const usersModel = require("../models/usersModel");
const {
  userSigninNames,
  userSigninBasicInfo,
  userSigninUsername,
  userSigninPassword,
} = require("../controllers/auth/usersSigninAuthController");
const {
  userLoginEmail,
  userLoginPassword,
  logout,
} = require("../controllers/auth/usersLoginAuthController");
const { authLimiter } = require("../middlewares/rateLimitAuth");

router.post("/signin/names", userSigninNames);
router.post(
  "/signin/basicInfo",
  requireStep("signin", "names"),
  userSigninBasicInfo
);
router.post(
  "/signin/username",
  requireStep("signin", "basicInfo"),
  userSigninUsername
);
router.post(
  "/signin/password",
  requireStep("signin", "username"),
  userSigninPassword
);
router.post("/login/email", authLimiter, userLoginEmail);
router.post(
  "/login/password",
  requireStep("login", "email"),
  authLimiter,
  userLoginPassword
);
router.get("/logout", logout);

router.get("/signin", function (req, res) {
  try {
    console.log(req.csrfToken());
    res.render("signInPages/signinName");
  } catch (error) {
    console.log(error.message);
  }
});
router.get("/signin/names", function (req, res) {
  try {
    res.render("signInPages/signinName");
  } catch (error) {
    console.log(error.message);
  }
});

router.get(
  "/signin/basicInfo",
  requireStep("signin", "names"),
  function (req, res) {
    try {
      let error = req.flash("error");

      res.render("signInPages/signinBasicInfo");
    } catch (error) {
      console.log(error.message);
    }
  }
);
router.get(
  "/signin/username",
  requireStep("signin", "basicInfo"),
  function (req, res) {
    try {
      let error = req.flash("error");

      res.render("signInPages/signinUsername");
    } catch (error) {
      console.log(error.message);
    }
  }
);
router.get(
  "/signin/password",
  requireStep("signin", "username"),
  function (req, res) {
    try {
      let error = req.flash("error");

      res.render("signInPages/signinPassword");
    } catch (error) {
      console.log(error.message);
    }
  }
);
router.get("/login", function (req, res) {
  try {
    res.render("loginPages/loginEmail");
  } catch (error) {
    console.log(error.message);
  }
});
router.get("/login/email", function (req, res) {
  try {
    res.render("loginPages/loginEmail");
  } catch (error) {
    console.log(error.message);
  }
});

router.get(
  "/login/password",
  requireStep("login", "email"),
  function (req, res) {
    try {
      const email = req.session.email;
      res.render("loginPages/loginPassword", { email });
    } catch (error) {
      console.log(error.message);
    }
  }
);
router.get("/login/forget", function (req, res) {
  try {
    res.render("forgetPages/forget");
  } catch (error) {
    console.log(error.message);
  }
});

module.exports = router;
