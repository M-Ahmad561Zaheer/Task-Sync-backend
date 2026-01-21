const express = require("express");
const router = express.Router();
// Check karein ke protect hi use ho raha hai
const { protect } = require("../middleware/authMiddleware");
const { getNotifications } = require("../controllers/notificationController");

// Line 6 yahan hai. Ensure karein getNotifications undefined na ho
if (getNotifications) {
    router.get("/", protect, getNotifications);
} else {
    console.error("❌ Error: getNotifications function is undefined in notificationRoutes");
}

module.exports = router;