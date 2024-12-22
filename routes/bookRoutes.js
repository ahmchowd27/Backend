const express = require("express");
const { getBooksByMood } = require("../controllers/bookControllers");
const authenticateUser = require("../middleware/auth");
const router = express.Router();

// Protected route
router.get("/:mood", authenticateUser, getBooksByMood);

module.exports = router;
