const usersModel = require("../../models/usersModel");
const bcrypt = require("bcrypt");
const { generateToken } = require("../../utils/generateToken");

module.exports.userLoginEmail = async (req, res) => {
  try {
    const raw = (req.body.email || "").trim().toLowerCase();
    const errors = {};

    if (raw === "") {
      errors.email = "Enter an email or phone number";
      return res.status(400).json({ errors });
    }

    const local = raw.split("@")[0];
    const email = `${local}@gmail.com`;
    if (!/^[^\s@]+@gmail\.com$/.test(email)) {
      errors.email = "Enter a valid Gmail address";
      return res.status(400).json({ errors });
    }

    const exists = await usersModel.findOne({ email }).lean();
    if (!exists) {
      errors.email = "Couldn’t find your Google Account";
      return res.status(400).json({ errors });
    }

    req.session.email = email;
    return res.json({ redirect: "/users/login/password", email });
  } catch (error) {
    return res.status(500).json({
      errors: { generic: "Server Error: " + error.message }
    });
  }
};

module.exports.userLoginPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.session.email;
    const errors = {};

    if (password === "") {
      errors.password = "Enter a password";
      return res.status(400).json({ errors });
    }

    const user = await usersModel.findOne({ email });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!user || !isMatch) {
      errors.password = "Invalid email or password";
      return res.status(400).json({ errors });
    }

    await new Promise((resolve, reject) => {
      req.session.regenerate((err) => (err ? reject(err) : resolve()));
    });
    req.session.userId = user._id;
    req.session.save((err) => {
      if (err) console.error(err);
    });
    const { accessToken, refreshToken } = generateToken(user);
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 15, // 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    return res.json({ redirect: "/drive/home" });
  } catch (error) {
    return res.status(500).json({
      errors: { generic: "Server Error: " + error.message }
    });
  }
};

module.exports.logout = async (req, res) => {
  try {
    res.cookie("token", "", { maxAge: 0 });
    res.cookie("refreshToken", "", { maxAge: 0 });
    if (req.session) req.session.destroy();
    res.redirect("/");
  } catch (error) {
    res.redirect("/");
  }
};
