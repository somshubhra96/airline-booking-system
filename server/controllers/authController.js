const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email, and password are required." });
    if (password.length < 8) return res.status(400).json({ message: "Password must contain at least 8 characters." });

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(409).json({ message: "An account with this email already exists." });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword });
    res.status(201).json({ token: createToken(user._id), user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: "Could not create your account." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Email or password is incorrect." });

    res.status(200).json({ token: createToken(user._id), user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: "Could not sign you in." });
  }
};

module.exports = { register, login };
