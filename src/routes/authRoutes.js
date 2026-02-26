const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require('jsonwebtoken');
const { body } = require("express-validator");
const { registerUser, loginUser } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware"); 
const User = require("../models/User");

// ✅ Frontend URL ko dynamic banayein
const FRONTEND_URL = process.env.NODE_ENV === "production" 
  ? "https://az-tasksync.vercel.app" // Aapka live frontend URL
  : "http://localhost:5173";

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
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login`, session: false }),
  (req, res) => {
    // Token generate karein
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const userData = JSON.stringify({ name: req.user.name, email: req.user.email });
    
    // ✅ Live Frontend par redirect karein
    res.redirect(`${FRONTEND_URL}/login-success?token=${token}&user=${encodeURIComponent(userData)}`);
  }
);

// --- GitHub Social Auth ---
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: `${FRONTEND_URL}/login`, session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const userData = JSON.stringify({ name: req.user.name, email: req.user.email });
    
    // ✅ Live Frontend par redirect karein
    res.redirect(`${FRONTEND_URL}/login-success?token=${token}&user=${encodeURIComponent(userData)}`);
  }
);

module.exports = router;