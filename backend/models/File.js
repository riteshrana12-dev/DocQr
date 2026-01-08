const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: String,
  filepath: String,
  pin: String,

  attemptsLeft: {
    type: Number,
    default: 3,
  },

  expiresAt: {
    type: Date,
    required: true,
  },

  size: Number,
});

module.exports = mongoose.model("File", fileSchema);
