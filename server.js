require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./src/config/db");
const passport = require("./src/config/passport");

const app = express();
const server = http.createServer(app);

// 1. Database Connection
connectDB();

const allowedOrigins = [
  "https://az-tasksync.vercel.app",
  "https://frontend-task-sync.vercel.app",
  "http://localhost:5173",
];

// 2. Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// --- Middlewares ---
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(passport.initialize());

// Attach io to every request (taskController mein use hoga)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// --- Routes ---
app.get("/", (req, res) => {
  res.send(`🚀 TaskSync Backend is running in ${process.env.NODE_ENV || "development"} mode...`);
});

app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/tasks", require("./src/routes/taskRoutes"));
app.use("/api/analytics", require("./src/routes/analyticsRoutes"));
app.use("/api/notifications", require("./src/routes/notificationRoutes")); // ✅ Yeh missing tha!

// --- Socket Logic ---
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // User apne userId ke room mein join karta hai
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`✅ User ${userId} joined their room`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error("Global Error:", err.message);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// Local development server
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// Vercel ke liye
module.exports = app;