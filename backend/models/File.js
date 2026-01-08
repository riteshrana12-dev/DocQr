const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    /* Original uploaded file name */
    originalName: {
      type: String,
      required: true,
    },

    /* Cloudinary secure URL */
    cloudinaryUrl: {
      type: String,
      required: true,
    },

    /* Encrypted PIN */
    pinHash: {
      type: String,
      required: true,
    },

    /* Remaining PIN attempts */
    attemptsLeft: {
      type: Number,
      default: 5, // 🔒 PIN attempt limit
    },

    /* File expiry time */
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // ⏳ 24 hours
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

module.exports = mongoose.model("File", fileSchema);
