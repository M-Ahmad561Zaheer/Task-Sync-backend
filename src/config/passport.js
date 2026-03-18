const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");

// --- Reusable Social Auth Logic ---
const socialAuthLogic = async (profile, done) => {
  try {
    const email =
      profile.emails && profile.emails[0]
        ? profile.emails[0].value
        : `${profile.username}@github-noemail.com`;

    let user = await User.findOne({ email });

    if (!user) {
      // ✅ Fix: Random password nahi dalna - User model khud handle karta hai
      user = await User.create({
        name: profile.displayName || profile.username || "User",
        email,
        avatar:
          profile.photos && profile.photos[0]
            ? profile.photos[0].value
            : profile._json?.avatar_url || "",
        // Password bilkul mat do - model ki required condition handle karti hai
        googleId: profile.provider === "google" ? profile.id : undefined,
        githubId: profile.provider === "github" ? profile.id : undefined,
      });
    } else {
      // Existing user - sirf missing IDs update karein
      let updated = false;
      if (profile.provider === "google" && !user.googleId) {
        user.googleId = profile.id;
        updated = true;
      }
      if (profile.provider === "github" && !user.githubId) {
        user.githubId = profile.id;
        updated = true;
      }
      if (updated) await user.save();
    }

    return done(null, user);
  } catch (err) {
    console.error("Social Auth Error:", err);
    return done(err, null);
  }
};

// --- Google Strategy ---
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      (accessToken, refreshToken, profile, done) =>
        socialAuthLogic(profile, done)
    )
  );
  console.log("✅ Google Strategy loaded");
} else {
  console.warn("⚠️ Google OAuth credentials missing in .env");
}

// --- GitHub Strategy ---
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
      },
      (accessToken, refreshToken, profile, done) =>
        socialAuthLogic(profile, done)
    )
  );
  console.log("✅ GitHub Strategy loaded");
} else {
  console.warn("⚠️ GitHub OAuth credentials missing in .env");
}

// --- Serialize / Deserialize ---
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;