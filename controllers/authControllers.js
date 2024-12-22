const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Register User
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  console.log("Received login request");
  console.log("Email:", email);
  console.log("Password:", password);

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    console.log("User found:", user);

    if (!user) {
      console.error("No user found with this email.");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isPasswordMatch = await user.matchPassword(password);
    console.log("Password match:", isPasswordMatch);

    if (!isPasswordMatch) {
      console.error("Password does not match.");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token and return response
    const token = generateToken(user._id);
    console.log("Generated token:", token);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error("Error during login process:", error.message);
    res.status(500).json({ message: "Error logging in user", error });
  }
};

module.exports = { registerUser, loginUser };
