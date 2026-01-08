const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  originalName: String,
  storedName: String,
  pinHash: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "7d", // auto-delete after 7 days (optional 🔥)
  },
});

module.exports = mongoose.model("File", fileSchema);
