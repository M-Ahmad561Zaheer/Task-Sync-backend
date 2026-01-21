const express = require("express");
const router = express.Router();
// Aapka middleware 'protect' export kar raha hai, to destructuring use karein
const { protect } = require("../middleware/authMiddleware");
const taskCtrl = require("../controllers/taskController");

// CRUD Routes
router.post("/", protect, taskCtrl.createTask);
router.get("/", protect, taskCtrl.getTasks);
router.put("/:id", protect, taskCtrl.updateTask);
router.delete("/:id", protect, taskCtrl.deleteTask);

// Collaboration & Status Routes
router.put("/:id/share", protect, taskCtrl.shareTask);
router.get("/shared/list", protect, taskCtrl.getSharedTasks); 
router.put("/:id/status", protect, taskCtrl.updateStatus);

module.exports = router;