const usersModel = require("../models/usersModel");
const jwt = require("jsonwebtoken");

module.exports = async function (req, res, next) {
  // Check session first
  console.log("Session check:", req.session?.userId ? "YES" : "NO");
  if (!req.session?.userId) {
    return res.status(401).redirect("/sessionEnded");
  }

  // Check JWT token
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/");
  }

  try {
    let decoded = jwt.verify(token, process.env.JWT_KEY);
    let user = await usersModel
      .findOne({ email: decoded.email })
      .select("-password");

    if (!user) {
      return res.redirect("/");
    }

    // Refresh the token cookie to match rolling session behavior
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 30, // 30 minutes
    });

    // IMPORTANT: Set req.user so routes can access it
    req.user = user;
    res.locals.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.redirect("/");
  }
};
