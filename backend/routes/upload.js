const express = require("express");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const File = require("../models/File");
const cloudinary = require("../utils/cloudinary");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function uploadToCloudinary(buffer, originalName) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw", // REQUIRED
        folder: "docqr-files", // 🔥 IMPORTANT
        public_id: originalName, // keep original name
        use_filename: true,
        unique_filename: false,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary error:", error);
          reject(error);
        } else {
          resolve(result);
        }
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

    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname
    );

    const pinHash = await bcrypt.hash(pin, 10);

    const fileDoc = await File.create({
      originalName: req.file.originalname,
      cloudinaryUrl: result.secure_url,
      size: req.file.size,
      pinHash,
      attemptsLeft: 5,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    res.json({
      success: true,
      fileId: fileDoc._id,
      accessUrl: `${process.env.FRONTEND_BASE_URL}/access/${fileDoc._id}`,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
