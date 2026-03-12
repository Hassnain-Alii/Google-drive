const usersModel = require("../../models/usersModel");
const bcrypt = require("bcrypt");
const { generateToken } = require("../../utils/generateToken");
const flash = require("flash");
const { pwnedPassword } = require("hibp");

module.exports.userSigninNames = async (req, res) => {
  try {
    const { firstname, lastname = "" } = req.body;
    const errors = {};
    if (!firstname || firstname === " ") errors.firstname = "Enter your name";
    if ((firstname.length > 0) & (firstname.length < 3))
      errors.firstname = "Are you sure you entered your name correctly?";
    if (Object.keys(errors).length) return res.status(400).json({ errors });
    req.session.user = { firstname, lastname };
    return res.json({ redirect: "/users/signin/basicInfo" });
  } catch (error) {
    console.log("Names step error:", error.message);
    return res.redirect("/signin");
  }
};
module.exports.userSigninBasicInfo = async (req, res) => {
  try {
    const { birthMonth, birthDay, birthYear, gender } = req.body;
    const errors = {};
    if (!birthMonth) errors.birthMonth = "Choose a month";
    if (!birthDay || birthDay < 1 || birthDay > 31)
      errors.birthDay = "Day must be 1-31";
    if (!birthYear || birthYear < 1900 || birthYear > new Date().getFullYear())
      errors.birthYear = "Enter a valid year";
    if (!gender) errors.gender = "Please choose a gender";

    if (Object.keys(errors).length) return res.status(400).json({ errors });

    req.session.birthDate = new Date(birthYear, birthMonth - 1, birthDay);
    req.session.gender = gender;
    return res.json({ redirect: "/users/signin/username" });
  } catch (error) {
    console.log("Basic-info step error:", error.message);
    return res.redirect("/users/signin/basicInfo");
  }
};
module.exports.userSigninUsername = async (req, res) => {
  try {
    const raw = (req.body.username || "").trim().toLowerCase();
    const errors = {};

    if (raw === "") {
      errors.username = "Enter your username";
      return res.status(400).json({ errors });
    }

    const local = raw.split("@")[0];
    if (local.length < 6) {
      errors.username =
        "Sorry, your username must be between 6 and 30 characters long.";
      return res.status(400).json({ errors });
    }

    const email = `${local}@gmail.com`;
    if (!/^[^\s@]+@gmail\.com$/.test(email)) {
      errors.username = "Enter a valid Gmail address";
      return res.status(400).json({ errors });
    }

    const exists = await usersModel.findOne({ email }).lean();
    if (exists) {
      errors.username = "That username is taken. Try another.";
      return res.status(400).json({ errors });
    }

    req.session.email = email;
    return res.json({ redirect: "/users/signin/password" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
};
module.exports.userSigninPassword = async (req, res) => {
  try {
    const { firstname, lastname } = req.session.user || {};
    const { password, confirmPassword } = req.body;
    const birthDate = req.session.birthDate;
    const gender = req.session.gender;
    const email = req.session.email;
    const errors = {};
    if (password === "") {
      errors.password = "Enter your password";
      return res.status(400).json({ errors });
    }
    if (!password || password.length < 8) {
      errors.password = "Use 8 characters or more for your password";
      return res.status(400).json({ errors });
    }
    // if (!/[A-Z]/.test(password)) errors.password = "Need an uppercase letter";
    // if (!/[a-z]/.test(password)) errors.password = "Need a lowercase letter";
    // if (!/[0-9]/.test(password)) errors.password = "Need a number";
    // if (!/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password))
    //   errors.password = "Need a special character";

    const breachCount = await pwnedPassword(password);
    if (breachCount > 0) {
      errors.password =
        "This password has appeared in data breaches – choose another";
      return res.status(400).json({ errors });
    }

    if (confirmPassword === "") {
      errors.confirmPassword = "Confirm your password";
      return res.status(400).json({ errors });
    }
    if (confirmPassword !== password) {
      errors.confirmPassword = "Passwords do not match.";
      return res.status(400).json({ errors });
    }
    if (Object.keys(errors).length) return res.status(400).json({ errors });
    console.log("Values for final check:", {
      firstname,
      lastname,
      birthDate,
      gender,
      email,
      password,
    });
    const hash = await bcrypt.hash(password, 12);
    const user = await usersModel.create({
      firstname,
      lastname,
      birthDate,
      gender,
      email,
      password: hash,
    });
    const token = generateToken(user);
    res.cookie("token", token);
    delete req.session.user;
    delete req.session.birthDate;
    delete req.session.gender;
    delete req.session.email;
    return res
      .status(201)
      .json({ message: "Account created", redirect: "/users/login" });
  } catch (error) {
    console.log("Password step error:", error.message);
    return res.status(500).send({
      message: "Internal server error",
      redirect: "/users/signin/password",
    });
  }
};
