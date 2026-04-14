import express from "express";
const app = express();

// Simple keep-alive endpoint for Replit + UptimeRobot
app.get("/", (req, res) => {
  res.send("WWM Discord Bot is running!");
});

// Replit provides PORT automatically
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`[KEEP-ALIVE] Server running on port ${port}`);
});
