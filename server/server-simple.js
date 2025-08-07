const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Simple test routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Simple server is running",
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
  console.log(`🚀 Simple server running on port ${PORT}`);
});
