// Backend Model Example
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, default: "Pending" },
  dueDate: { type: Date },
  link: { type: String }, // 👈 Yeh exact 'link' hona chahiye
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});