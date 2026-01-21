const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  try {
    // 💡 req.user.id check karein ke authMiddleware sahi pass kar raha hai
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};