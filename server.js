require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./src/config/db");
const passport = require("passport"); // ✅ 1. Passport require karein

// ✅ 2. Passport Config Import karein (Jo file hum ne banayi thi)
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

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// ✅ 3. Passport Initialize (Social Login ke liye lazmi hai)
app.use(passport.initialize());

// Root route
app.get("/", (req, res) => {
  res.send(`🚀 TaskSync Backend is running in ${process.env.NODE_ENV || 'development'} mode...`);
});

// Attach io to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

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

// Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/tasks", require("./src/routes/taskRoutes"));
app.use("/api/analytics", require("./src/routes/analyticsRoutes"));

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// ✅ ISAY AISE UPDATE KAREIN
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

module.exports = app;