const express = require("express");
const app = express();

app.use(express.json());

// Test route
app.post("/test", (req, res) => {
  res.json({ message: "Test route works!", body: req.body });
});

app.get("/test", (req, res) => {
  res.json({ message: "Test GET route works!" });
});

app.listen(5001, () => {
  console.log("Test server running on port 5001");
});
