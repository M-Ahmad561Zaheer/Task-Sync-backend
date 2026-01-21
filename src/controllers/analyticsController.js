const Task = require("../models/Task");

exports.overview = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Fetching analytics for User ID:", userId);

    // Flexible query to catch different field names
    const myTasks = await Task.find({
      $or: [
        { owner: userId }, 
        { user: userId }, 
        { sharedWith: userId }
      ]
    });

    console.log(`Total tasks found in DB for this user: ${myTasks.length}`);

    // Case-insensitive filtering
    const result = {
      pending: myTasks.filter(t => t.status?.toLowerCase() === "pending").length,
      inProgress: myTasks.filter(t => t.status?.toLowerCase() === "in progress").length,
      completed: myTasks.filter(t => t.status?.toLowerCase() === "completed").length,
      // AnalyticsController.js suggestion
overdue: myTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Completed").length
    };

    console.log("📊 Final Analytics Result:", result);
    res.json(result);
  } catch (err) {
    console.error("Analytics Controller Error:", err);
    res.status(500).json({ message: "Error fetching analytics" });
  }
};