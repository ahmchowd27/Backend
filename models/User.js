const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const bookSchema = new mongoose.Schema({
  bookId: String,
  title: String,
  authors: [String],
  description: String,
  coverImage: String,
  link: String,
  genre: String,
  progress: { type: Number, default: 0 },
  notes: { type: String, default: "" },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  savedBooks: [bookSchema],
  finishedBooks: [bookSchema],
});

// Pre-save middleware to hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
