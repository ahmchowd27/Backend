const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { blacklist } = require("../controllers/authControllers"); // Import blacklist

// Middleware to authenticate user
const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized access." });
  }

  // Check if token is blacklisted
  if (blacklist.includes(token)) {
    return res
      .status(401)
      .json({ message: "Token is blacklisted. Please log in again." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) throw new Error("User not found");
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = authenticateUser;
