require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const uploadRoutes = require("./routes/upload");
const accessRoutes = require("./routes/access");
const qrRoutes = require("./routes/qr");

const app = express();

/* ✅ CORS — VERY IMPORTANT */
app.use(
  cors({
    origin: [
      "https://docqr-frontend.onrender.com",
      "http://localhost:5173", // local dev (safe to keep)
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

/* Handle preflight requests */
app.options("*", cors());

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

// Health check
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
