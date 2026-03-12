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
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error", err: err.message });
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
    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      // secure: process.env.NODE_ENV === "development",
      maxAge: 1000 * 60 * 30, // 30 minutes
    });
    return res.json({ redirect: "/drive/home" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports.logout = async (req, res) => {
  try {
    res.cookie("token", "");
    res.redirect("/");
    console.log("logout successfully");
  } catch (error) {
    res.redirect("/");
    console.log("Error logging out user:", error.message);
    res.status(500).send({ message: "Internal server error" });
  }
};
