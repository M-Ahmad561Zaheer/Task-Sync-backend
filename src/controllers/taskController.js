const Task = require("../models/Task");
const User = require("../models/User");
const mongoose = require("mongoose"); // ✅ ObjectId conversion ke liye zaroori hai
const sendNotification = require("../utils/sendNotification");

// 1. Get All Tasks (Owned + Shared) - YEH FUNCTION MISSING THA
exports.getTasks = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    // Logic: Mere apne tasks + jo mere sath share kiye gaye hain
    const tasks = await Task.find({ 
      $or: [{ owner: userId }, { sharedWith: userId }] 
    }).sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (err) {
    console.error("Error in getTasks:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// 2. Create Task
exports.createTask = async (req, res) => {
  try {
    const task = new Task({ ...req.body, owner: req.user.id });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 3. Get Shared Tasks ONLY (List view ke liye)
exports.getSharedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ sharedWith: req.user.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 4. Update Task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.owner.toString() !== req.user.id && !task.sharedWith.includes(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(task, req.body);
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 5. Delete Task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.owner.toString() !== req.user.id) return res.status(403).json({ message: "Only owner can delete" });

    await task.deleteOne();
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 6. Share Task (Email Se)
exports.shareTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const userToShareWith = await User.findOne({ email: email.toLowerCase() });
    if (!userToShareWith) return res.status(404).json({ message: "User not found!" });

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.sharedWith.includes(userToShareWith._id)) {
      return res.status(400).json({ message: "Already shared" });
    }

    task.sharedWith.push(userToShareWith._id);
    await task.save();

    await sendNotification(userToShareWith._id, `New task shared: ${task.title}`, req.io);
    res.status(200).json({ message: "Task shared!" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 7. Update Status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = status;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};