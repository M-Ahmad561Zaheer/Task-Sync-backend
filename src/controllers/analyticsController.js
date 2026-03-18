const Task = require("../models/Task");
const mongoose = require("mongoose");

exports.overview = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // ✅ Fix: Sirf OWNED tasks count karein, shared tasks nahi
    const myTasks = await Task.find({ owner: userId });

    console.log(`📊 Analytics - User: ${userId}, Total owned tasks: ${myTasks.length}`);

    const now = new Date();

    const result = {
      total: myTasks.length,
      pending: myTasks.filter((t) => t.status === "Pending").length,
      inProgress: myTasks.filter((t) => t.status === "In Progress").length,
      completed: myTasks.filter((t) => t.status === "Completed").length,
      overdue: myTasks.filter(
        (t) =>
          t.dueDate &&
          new Date(t.dueDate) < now &&
          t.status !== "Completed"
      ).length,

      // Bonus: Shared tasks ka alag count
      sharedWithMe: await Task.countDocuments({ sharedWith: userId }),
      sharedByMe: await Task.countDocuments({
        owner: userId,
        sharedWith: { $not: { $size: 0 } },
      }),
    };

    console.log("📊 Final Analytics Result:", result);
    res.json(result);
  } catch (err) {
    console.error("Analytics Controller Error:", err);
    res.status(500).json({ message: "Error fetching analytics" });
  }
};