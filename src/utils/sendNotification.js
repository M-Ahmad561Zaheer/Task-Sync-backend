const Notification = require("../models/Notification");

const sendNotification = async (userId, message, io) => {
  try {
    // 1. Database mein save karein (taake offline user baad mein dekh sakay)
    const newNotif = new Notification({
      user: userId,
      message: message,
    });
    await newNotif.save();

    // 2. Online user ko real-time bhejien
    if (io) {
      io.to(userId.toString()).emit("taskShared", {
        message: message,
        title: "Task Update",
        date: new Date(),
        id: newNotif._id // Notification ID bhi bhejien
      });
      console.log(`✅ Real-time notification sent to room: ${userId}`);
    }
  } catch (err) {
    console.error("❌ Notification Error:", err);
  }
};

module.exports = sendNotification;