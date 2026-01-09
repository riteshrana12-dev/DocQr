const express = require("express");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const File = require("../models/File");
const cloudinary = require("../utils/cloudinary");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/* ☁️ Helper: upload buffer to Cloudinary (Promise-based) */
function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(buffer);
  });
}

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { pin } = req.body;

    if (!req.file || !pin) {
      return res.status(400).json({ error: "File and PIN required" });
    }

    /* ☁ Upload file */
    const result = await uploadToCloudinary(req.file.buffer);

    /* 🔐 Hash PIN */
    const pinHash = await bcrypt.hash(pin, 10);

    /* 📄 Save metadata */
    const fileDoc = await File.create({
      originalName: req.file.originalname,
      cloudinaryUrl: result.secure_url,
      size: req.file.size,
      pinHash,
      attemptsLeft: 5,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    /* ✅ Respond ONLY after everything is ready */
    return res.json({
      success: true,
      fileId: fileDoc._id,
      accessUrl: `${process.env.FRONTEND_BASE_URL}/access/${fileDoc._id}`,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
