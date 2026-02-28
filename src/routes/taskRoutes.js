const express = require("express");
const router = express.Router();
// Aapka middleware 'protect' export kar raha hai, to destructuring use karein
const { protect } = require("../middleware/authMiddleware");
const taskCtrl = require("../controllers/taskController");

// taskRoutes.js

// 1. Pehle Static/Specific Routes rakhein
router.get("/shared/list", protect, taskCtrl.getSharedTasks); // ✅ Isay upar le aayein
router.get("/", protect, taskCtrl.getTasks);

// 2. Phir Dynamic (ID waale) Routes rakhein
router.post("/", protect, taskCtrl.createTask);
router.put("/:id", protect, taskCtrl.updateTask);
router.delete("/:id", protect, taskCtrl.deleteTask);
router.put("/:id/share", protect, taskCtrl.shareTask);
router.put("/:id/status", protect, taskCtrl.updateStatus);

module.exports = router;