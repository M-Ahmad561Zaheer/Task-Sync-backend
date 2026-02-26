const passport = require('passport');
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
        avatar: (profile.photos && profile.photos[0]) ? profile.photos[0].value : (profile._json ? profile._json.avatar_url : ''),
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

// --- Google Strategy (Safe Initialization) ---
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback"
    },
    (accessToken, refreshToken, profile, done) => socialAuthLogic(profile, done)
  ));
} else {
  console.warn("⚠️ Google OAuth IDs missing. Skipping Google Strategy.");
}

// --- GitHub Strategy (Safe Initialization) ---
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL || "/api/auth/github/callback"
    },
    (accessToken, refreshToken, profile, done) => socialAuthLogic(profile, done)
  ));
} else {
  console.warn("⚠️ GitHub OAuth IDs missing. Skipping GitHub Strategy.");
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;