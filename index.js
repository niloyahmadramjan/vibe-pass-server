const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("✅ vibepass server is running");
});

// Payment Routes
const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api", paymentRoutes);

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
