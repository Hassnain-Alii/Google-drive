const usersModel = require("../models/usersModel");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generateToken");

module.exports = async function (req, res, next) {
  // Check session first
  if (!req.session?.userId) {
    return res.status(401).redirect("/users/login");
  }

  // Check JWT token
  let token = req.cookies.token;
  const refreshToken = req.cookies.refreshToken;

  if (!token && !refreshToken) {
    return res.redirect("/users/login");
  }

  try {
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_KEY);
    } catch (err) {
      if (!refreshToken) throw err;
      // Try refresh token logic
      const refreshDecoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_KEY || "refresh_secret"
      );
      const user = await usersModel.findById(refreshDecoded.userId);
      if (!user) throw new Error("User not found");

      // Issue new access token
      const { accessToken } = generateToken(user);
      token = accessToken;
      res.cookie("token", token, {
        httpOnly: true,
        secure: false, // development
        maxAge: 1000 * 60 * 15,
      });
      decoded = jwt.verify(token, process.env.JWT_KEY);
    }

    let user = await usersModel
      .findOne({ email: decoded.email })
      .select("-password");

    if (!user) {
      return res.redirect("/users/login");
    }

    // Refresh the token cookie to match rolling session behavior
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // development
      maxAge: 1000 * 60 * 15,
    });

    req.user = user;
    res.locals.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.redirect("/users/login");
  }
};
