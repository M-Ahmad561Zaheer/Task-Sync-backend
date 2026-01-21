const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending"
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  attachments: [String],
  dueDate: Date
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);