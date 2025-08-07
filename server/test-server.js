const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "DailyDev API Server is running! 🚀",
    endpoints: {
      health: "GET /api/health",
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
    },
    timestamp: new Date().toISOString(),
  });
});

// Simple test routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Test server is running",
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/auth/register", (req, res) => {
  console.log("Register request:", req.body);
  res.json({
    message: "Register endpoint works!",
    data: req.body,
  });
});

app.post("/api/auth/login", (req, res) => {
  console.log("Login request:", req.body);
  res.json({
    message: "Login endpoint works!",
    data: req.body,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
