const jwt = require("jsonwebtoken");
const User = require("../models/User"); // User model import karein

const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ✅ Password chorr kar baaki user data request mein add karein
    // Isse 'req.user.name' humein controllers mein mil jayega
    req.user = await User.findById(decoded.id).select("-password");
    
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

module.exports = { protect };