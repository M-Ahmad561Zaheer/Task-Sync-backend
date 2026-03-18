const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const taskCtrl = require("../controllers/taskController");

// ✅ IMPORTANT: Specific routes PEHLE aani chahiye, dynamic /:id routes BAAD mein
// Agar /shared/list ko neeche rakho toh Express use /:id samajh leta hai

// --- Specific Routes (Pehle) ---
router.get("/shared/list", protect, taskCtrl.getSharedTasks); // ✅ /:id se pehle

// --- Main CRUD Routes ---
router.get("/", protect, taskCtrl.getTasks);          // My tasks only
router.post("/", protect, taskCtrl.createTask);        // Create new task

// --- Dynamic ID Routes (Baad mein) ---
router.put("/:id", protect, taskCtrl.updateTask);      // Update task
router.delete("/:id", protect, taskCtrl.deleteTask);   // Delete task
router.put("/:id/share", protect, taskCtrl.shareTask); // Share task
router.put("/:id/status", protect, taskCtrl.updateStatus); // Update status

module.exports = router;