const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const analytics = require("../controllers/analyticsController");

// Sirf overview ko rakhein kyunki wahi controller mein export hai
if (analytics.overview) {
    router.get("/overview", protect, analytics.overview);
    console.log("✅ Analytics Overview route loaded");
} else {
    console.error("❌ Analytics overview function is missing in Controller!");
}

module.exports = router;