const express = require("express");
const router = express.Router();
// 1. Destructure protect from middleware
const { protect } = require("../middleware/authMiddleware");
const analytics = require("../controllers/analyticsController");

// 2. Use 'protect' instead of 'auth'
// Also ensuring functions exist before routing to prevent crash
if (analytics.overview && analytics.trends) {
    router.get("/overview", protect, analytics.overview);
    router.get("/trends", protect, analytics.trends);
} else {
    console.error("❌ Analytics controller functions are missing!");
}

module.exports = router;