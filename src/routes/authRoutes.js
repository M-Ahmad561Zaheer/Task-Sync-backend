const express = require("express");
const router = express.Router();
const passport = require("passport"); // 👈 Ye add kiya
const jwt = require('jsonwebtoken');
const { body } = require("express-validator");
const { registerUser, loginUser } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware"); 
const User = require("../models/User");

// --- Standard Auth Routes ---
router.post("/register", 
  body("name").notEmpty(), 
  body("email").isEmail(),
  body("password").isLength({ min: 6 }), 
  registerUser
);

router.post("/login", loginUser);

// --- Profile Route ---
router.put("/update-profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id); 
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name || user.name;
    await user.save();

    res.json({ message: "Profile updated", name: user.name });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// --- Google Social Auth ---
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const userData = JSON.stringify({ name: req.user.name, email: req.user.email });
    
    // Frontend redirect with data
    res.redirect(`http://localhost:5173/login-success?token=${token}&user=${encodeURIComponent(userData)}`);
  }
);

// --- GitHub Social Auth ---
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const userData = JSON.stringify({ name: req.user.name, email: req.user.email });
    
    res.redirect(`http://localhost:5173/login-success?token=${token}&user=${encodeURIComponent(userData)}`);
  }
);

module.exports = router;