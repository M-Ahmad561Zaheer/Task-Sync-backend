const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { registerUser, loginUser } = require("../controllers/authController");

// ✅ YE LINE CHECK KAREIN - protect ko destructure karke nikalna hai
const { protect } = require("../middleware/authMiddleware"); 

const User = require("../models/User");

router.post("/register", 
  body("name").notEmpty(), 
  body("email").isEmail(),
  body("password").isLength({ min: 6 }), 
  registerUser
);

router.post("/login", loginUser);

// Profile Update Route
router.put("/update-profile", protect, async (req, res) => {
  try {
    // protect middleware req.user set kar deta hai
    const user = await User.findById(req.user._id); 
    
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name || user.name;
    await user.save();

    res.json({ message: "Profile updated", name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;