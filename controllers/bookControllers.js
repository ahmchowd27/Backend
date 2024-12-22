const axios = require("axios");
const User = require("../models/User");

// 1. Fetch Unique Books by Mood
const getBooksByMood = async (req, res) => {
  const mood = req.params.mood.toLowerCase();
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    if (mood === "saved") {
      // Return user's saved books
      return res.json({ mood, genre: "saved", books: user.savedBooks });
    }

    // Existing logic for other moods
    const moodToGenre = {
      happy: "fiction",
      sad: "self-help",
      excited: "adventure",
      relaxed: "romance",
    };

    const genre = moodToGenre[mood] || "general";
    const seenBookIds = [
      ...user.savedBooks.map((book) => book.bookId),
      ...user.finishedBooks.map((book) => book.bookId),
    ];

    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=subject:${genre}`
    );

    const books = response.data.items
      .filter((item) => !seenBookIds.includes(item.id))
      .map((item) => ({
        bookId: item.id,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors || ["Unknown"],
        description: item.volumeInfo.description || "No description available",
        coverImage: item.volumeInfo.imageLinks?.thumbnail,
        link: item.volumeInfo.infoLink,
        genre,
      }));

    res.json({ mood, genre, books: books.slice(0, 5) });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching books", error: err.message });
  }
};

// 2. Save Book from Suggestions
const saveSuggestedBook = async (req, res) => {
  const { bookId, genre } = req.body;
  const userId = req.user.id;

  try {
    // Check if the book already exists in the saved list
    const user = await User.findById(userId);
    if (user.savedBooks.some((book) => book.bookId === bookId)) {
      return res.status(400).json({ message: "Book already saved." });
    }

    // Fetch book details from Google Books API
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes/${bookId}`
    );

    const bookData = response.data.volumeInfo;

    // Construct the book object to save
    const bookToSave = {
      bookId,
      title: bookData.title,
      authors: bookData.authors || ["Unknown"],
      description: bookData.description || "No description available",
      coverImage: bookData.imageLinks?.thumbnail,
      link: bookData.infoLink,
      genre,
    };

    // Save the book to the user's savedBooks list
    user.savedBooks.push(bookToSave);
    await user.save();

    res.status(201).json({ message: "Book saved successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error saving book", error: err.message });
  }
};
// 3. Mark Book as Finished
const markBookFinished = async (req, res) => {
  const { bookId } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    const bookIndex = user.savedBooks.findIndex(
      (book) => book.bookId === bookId
    );
    if (bookIndex === -1) {
      return res.status(404).json({ message: "Book not found in saved list." });
    }

    const finishedBook = user.savedBooks[bookIndex];
    user.savedBooks.splice(bookIndex, 1);
    user.finishedBooks.push(finishedBook);

    await user.save();
    res.status(200).json({ message: "Book marked as finished." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating book status", error: err.message });
  }
};

// 4. Update Book Progress and Notes
const updateBookProgress = async (req, res) => {
  const { bookId, progress, notes } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    const book = user.savedBooks.find((book) => book.bookId === bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found in saved list." });
    }

    if (progress !== undefined) book.progress = progress;
    if (notes !== undefined) book.notes = notes;

    await user.save();
    res.status(200).json({ message: "Book progress updated." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating book progress", error: err.message });
  }
};
const deleteBook = async (req, res) => {
  const bookId = req.params.bookId.trim(); // Trim whitespace or newline characters
  const userId = req.user.id;

  try {
    console.log("Received bookId to delete (trimmed):", bookId);
    const user = await User.findById(userId);

    console.log(
      "User's savedBooks:",
      user.savedBooks.map((book) => book.bookId)
    );

    const bookIndex = user.savedBooks.findIndex(
      (book) => book.bookId === bookId
    );

    if (bookIndex === -1) {
      console.log("Book not found in savedBooks array.");
      return res.status(404).json({ message: "Book not found in saved list." });
    }

    user.savedBooks.splice(bookIndex, 1); // Remove the book
    await user.save();

    console.log("Book deleted successfully.");
    res.status(200).json({ message: "Book deleted successfully." });
  } catch (err) {
    console.error("Error deleting book:", err);
    res
      .status(500)
      .json({ message: "Error deleting book", error: err.message });
  }
};

module.exports = {
  getBooksByMood,
  saveSuggestedBook,
  markBookFinished,
  updateBookProgress,
  deleteBook,
};
