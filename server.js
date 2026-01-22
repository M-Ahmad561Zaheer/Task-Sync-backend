require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./src/config/db");

const app = express();
const server = http.createServer(app);

// ✅ Database Connection
connectDB();

// 🔔 Socket.IO setup
const io = new Server(server, {
  cors: {
    // Production mein process.env.FRONTEND_URL use karenge
    origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "*", 
    methods: ["GET", "POST"]
  },
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "*",
  credentials: true
}));
app.use(express.json());

// Root route (Checking status)
app.get("/", (req, res) => {
  res.send(`🚀 TaskSync Backend is running in ${process.env.NODE_ENV || 'development'} mode...`);
});

// Attach io to request (Used in controllers for real-time updates)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket Logic
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // ✅ Yeh part notification ke liye lazmi hai
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User with ID ${userId} joined their notification room.`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/tasks", require("./src/routes/taskRoutes"));
app.use("/api/analytics", require("./src/routes/analyticsRoutes"));

// ✅ Global Error Handler (Production ke liye zaroori hai)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// Purana server.listen hata kar ye likhein:
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

// Ye line Vercel ke liye sabse zaroori hai
module.exports = app;