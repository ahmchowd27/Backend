const express = require("express");
const authenticateUser = require("../middleware/auth");
const {
  getBooksByMood,
  saveSuggestedBook,
  markBookFinished,
  updateBookProgress,
  deleteBook,
} = require("../controllers/bookControllers");

const router = express.Router();

// Book Routes
router.get("/:mood", authenticateUser, getBooksByMood);
router.post("/save-suggested", authenticateUser, saveSuggestedBook);
router.put("/mark-finished", authenticateUser, markBookFinished);
router.put("/update-progress", authenticateUser, updateBookProgress);
router.delete("/delete-book/:bookId", authenticateUser, deleteBook);

module.exports = router;
