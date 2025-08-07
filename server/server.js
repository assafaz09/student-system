const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/dailydev", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));
// console.log("⚠️ MongoDB connection temporarily disabled for testing");

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "DailyDev API Server is running! 🚀",
    endpoints: {
      health: "GET /api/health",
      auth: "POST /api/auth/register, POST /api/auth/login",
      users: "GET/PUT /api/users",
      journal: "GET/POST /api/journal",
      tasks: "GET/POST /api/tasks",
      courses: "GET/POST /api/courses",
    },
    timestamp: new Date().toISOString(),
  });
});

// Routes with error handling
try {
  console.log("Loading auth routes...");
  app.use("/api/auth", require("./routes/auth"));
  console.log("✅ Auth routes loaded");
} catch (error) {
  console.error("❌ Error loading auth routes:", error.message);
}

try {
  console.log("Loading users routes...");
  app.use("/api/users", require("./routes/users"));
  console.log("✅ Users routes loaded");
} catch (error) {
  console.error("❌ Error loading users routes:", error.message);
}

try {
  console.log("Loading journal routes...");
  app.use("/api/journal", require("./routes/journal"));
  console.log("✅ Journal routes loaded");
} catch (error) {
  console.error("❌ Error loading journal routes:", error.message);
}

try {
  console.log("Loading tasks routes...");
  app.use("/api/tasks", require("./routes/tasks"));
  console.log("✅ Tasks routes loaded");
} catch (error) {
  console.error("❌ Error loading tasks routes:", error.message);
}

try {
  console.log("Loading courses routes...");
  app.use("/api/courses", require("./routes/courses"));
  console.log("✅ Courses routes loaded");
} catch (error) {
  console.error("❌ Error loading courses routes:", error.message);
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "DailyDev API is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
