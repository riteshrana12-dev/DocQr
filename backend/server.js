require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const uploadRoutes = require("./routes/upload");
const accessRoutes = require("./routes/access");
const qrRoutes = require("./routes/qr");

const app = express();

app.use(
  cors({
    origin: ["https://docqr-frontend.onrender.com"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
