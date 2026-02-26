require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./src/config/db");
const passport = require("passport");

// 1. Passport Config Import (Initialize se pehle import zaroori hai)
require("./src/config/passport"); 

const app = express();
const server = http.createServer(app);

// Database Connection
connectDB();

const allowedOrigins = [
  "https://az-tasksync.vercel.app",
  "https://frontend-task-sync.vercel.app",
  "http://localhost:5173"
];

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
});

// --- Middlewares ---
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// ✅ ZAROORI: Passport ko Routes se pehle initialize hona chahiye
app.use(passport.initialize());

// Attach io to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// --- Routes (Order Matters!) ---

// 1. Root route
app.get("/", (req, res) => {
  res.send(`🚀 TaskSync Backend is running in ${process.env.NODE_ENV || 'development'} mode...`);
});

// 2. API Routes (Aik hi baar define karein)
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/tasks", require("./src/routes/taskRoutes"));
app.use("/api/analytics", require("./src/routes/analyticsRoutes"));

// Socket Logic
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("join", (userId) => {
    socket.join(userId);
  });
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

module.exports = app;