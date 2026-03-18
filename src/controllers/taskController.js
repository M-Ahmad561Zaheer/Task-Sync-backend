const Task = require("../models/Task");
const User = require("../models/User");
const mongoose = require("mongoose");
const sendNotification = require("../utils/sendNotification");

// 1. Get MY Tasks ONLY (jo maine banaye hain)
exports.getTasks = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const tasks = await Task.find({ owner: userId })
      .populate("sharedWith", "name email") // ✅ yeh add karo
      .sort({ createdAt: -1 });

    // Frontend ko clearly pata chale ke yeh "my" tasks hain
    const tasksWithMeta = tasks.map((task) => ({
      ...task.toObject(),
      isOwner: true,
      isShared: false,
    }));

    res.json(tasksWithMeta);
  } catch (err) {
    console.error("Error in getTasks:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// 2. Create Task - sirf owner set hoga, sharedWith empty rahega
exports.createTask = async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      owner: req.user.id,
      sharedWith: [], // Naya task hamesha unshared banta hai
    });
    await task.save();
    res.status(201).json({ ...task.toObject(), isOwner: true, isShared: false });
  } catch (err) {
    console.error("Error in createTask:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// 3. Get Shared Tasks ONLY (jo doosron ne share kiye hain mere saath)
exports.getSharedTasks = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const tasks = await Task.find({ sharedWith: userId })
      .populate("owner", "name email avatar") // Owner info bhi aayegi
      .sort({ createdAt: -1 });

    // Frontend ko pata chale yeh shared hain, main owner nahi hoon
    const tasksWithMeta = tasks.map((task) => ({
      ...task.toObject(),
      isOwner: false,
      isShared: true,
    }));

    res.json(tasksWithMeta);
  } catch (err) {
    console.error("Error in getSharedTasks:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// 4. Update Task - sirf owner update kar sakta hai
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Sirf owner hi task update kar sakta hai
    if (task.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the owner can update this task" });
    }

    // sharedWith ko accidentally overwrite hone se bachaein
    const { sharedWith, owner, ...updateData } = req.body;
    Object.assign(task, updateData);
    await task.save();

    res.json({ ...task.toObject(), isOwner: true, isShared: false });
  } catch (err) {
    console.error("Error in updateTask:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// 5. Delete Task - sirf owner delete kar sakta hai
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the owner can delete this task" });
    }

    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error in deleteTask:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// 6. Share Task (Email se)
exports.shareTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    // Pehle task dhundho
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Sirf owner share kar sakta hai
    if (task.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the owner can share this task" });
    }

    // User dhundho jisse share karna hai
    const userToShareWith = await User.findOne({ email: email.toLowerCase() });
    if (!userToShareWith) return res.status(404).json({ message: "User not found with this email" });

    // Apne aap ko share karne ki koshish
    if (userToShareWith._id.toString() === req.user.id) {
      return res.status(400).json({ message: "You cannot share a task with yourself" });
    }

    // Already shared check
    if (task.sharedWith.map(id => id.toString()).includes(userToShareWith._id.toString())) {
      return res.status(400).json({ message: "Task already shared with this user" });
    }

    task.sharedWith.push(userToShareWith._id);
    await task.save();

    await sendNotification(
      userToShareWith._id,
      `"${task.title}" task has been shared with you`,
      req.io
    );

    res.status(200).json({ message: `Task shared with ${userToShareWith.name} successfully!` });
  } catch (err) {
    console.error("Error in shareTask:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// 7. Update Status - owner aur shared user dono kar sakte hain
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "In Progress", "Completed"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Owner ya shared user dono status update kar sakte hain
    const isOwner = task.owner.toString() === req.user.id;
    const isSharedUser = task.sharedWith.map(id => id.toString()).includes(req.user.id);

    if (!isOwner && !isSharedUser) {
      return res.status(403).json({ message: "Not authorized to update this task" });
    }

    task.status = status;
    await task.save();

    res.json({ ...task.toObject(), isOwner, isShared: !isOwner });
  } catch (err) {
    console.error("Error in updateStatus:", err);
    res.status(500).json({ message: "Server Error" });
  }
};