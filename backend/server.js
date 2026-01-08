require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const uploadRoutes = require("./routes/upload");
const accessRoutes = require("./routes/access");
const qrRoutes = require("./routes/qr");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// Routes
app.use("/upload", uploadRoutes);
app.use("/access", accessRoutes);
app.use("/qr", qrRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
