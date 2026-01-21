const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const analytics = require("../controllers/analyticsController");

// Sirf overview use karein kyunki wahi controller mein define hai
if (analytics.overview) {
    router.get("/overview", protect, analytics.overview);
} else {
    // Ye line server crash nahi karegi, sirf log degi
    console.error("❌ Analytics overview function is missing!");
}

module.exports = router;