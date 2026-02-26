const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, lowercase: true, required: true },
  // ✅ Password ko optional (required: false) kar diya hai social login ke liye
  password: { 
    type: String, 
    required: function() {
      // Agar google ya github ID nahi hai, tab password lazmi chahiye
      return !this.googleId && !this.githubId;
    }
  },
  // ✅ Social Login Fields
  googleId: { type: String, default: null },
  githubId: { type: String, default: null },
  avatar: { type: String, default: "" }, // Profile picture ke liye
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function(next) {
  // Agar password nahi hai (social login), toh hashing skip karein
  if (!this.password || !this.isModified("password")) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password during login
userSchema.methods.matchPassword = async function(enteredPassword) {
  // Agar social login wala user manually login ki koshish kare bina password ke
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);