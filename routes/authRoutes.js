const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
} = require("../controllers/authControllers");
const router = express.Router();

// User Authentication Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser); // Logout route

module.exports = router;
