const axios = require("axios");

const getBooksByMood = async (req, res) => {
  const mood = req.params.mood.toLowerCase();
  const moodToGenre = {
    happy: "fiction",
    sad: "self-help",
    excited: "adventure",
    relaxed: "romance",
  };

  const genre = moodToGenre[mood] || "general";

  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=subject:${genre}`
    );

    const books = response.data.items.map((item) => ({
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors,
      description: item.volumeInfo.description,
      link: item.volumeInfo.infoLink,
    }));

    res.json({ mood, genre, books: books.slice(0, 5) });
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch books at this time." });
  }
};

module.exports = { getBooksByMood };
