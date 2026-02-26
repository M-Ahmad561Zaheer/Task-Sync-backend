const passport = require('passport'); // 👈 Ye add karna zaroori hai
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

// --- Reusable Logic Function ---
const socialAuthLogic = async (profile, done) => {
  try {
    const email = profile.emails ? profile.emails[0].value : `${profile.username}@github.com`;
    
    let user = await User.findOne({ email: email });

    if (!user) {
      user = await User.create({
        name: profile.displayName || profile.username,
        email: email,
        avatar: profile.photos ? profile.photos[0].value : profile._json.avatar_url,
        // Social login ke liye password zaroori nahi hota but model validation ke liye dummy set kar rahe hain
        password: Math.random().toString(36).slice(-8), 
        googleId: profile.provider === 'google' ? profile.id : null,
        githubId: profile.provider === 'github' ? profile.id : null
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
};

// --- Google Strategy ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  (accessToken, refreshToken, profile, done) => socialAuthLogic(profile, done)
));

// --- GitHub Strategy ---
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/api/auth/github/callback"
  },
  (accessToken, refreshToken, profile, done) => socialAuthLogic(profile, done)
));

// Session handling (JWT use kar rahe hain toh ye basic honi chahiye)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
});

module.exports = passport; // 👈 Export karna mat bhoolna