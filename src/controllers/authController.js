const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if(user) return res.status(400).json({ message: "User already exists" });

    user = new User({ name, email, password });
    await user.save();

    res.status(201).json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
  } catch(err) { res.status(500).json({ message: "Server Error" }); }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if(!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
  } catch(err) { res.status(500).json({ message: "Server Error" }); }
};