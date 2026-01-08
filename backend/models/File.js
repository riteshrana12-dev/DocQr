const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema(
  {
    /* 📄 FILE INFO */
    originalName: {
      type: String,
      required: true,
    },

    fileUrl: {
      type: String,
      required: true, // Cloudinary URL
    },

    size: {
      type: Number, // bytes
      required: true,
    },

    /* 🔐 SECURITY */
    pinHash: {
      type: String,
      required: true,
    },

    attemptsLeft: {
      type: Number,
      default: 3, // 🔒 PIN attempt limit
    },

    /* ⏳ EXPIRY */
    expiresAt: {
      type: Date,
      default: () => Date.now() + 24 * 60 * 60 * 1000, // ⏰ 24 hours
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

module.exports = mongoose.model("File", FileSchema);
