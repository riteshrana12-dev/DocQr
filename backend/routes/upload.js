const express = require("express");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const File = require("../models/File");
const cloudinary = require("../utils/cloudinary");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // ⛔ 10MB MAX
});

function uploadToCloudinary(buffer, mimetype) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: mimetype.startsWith("video") ? "video" : "raw",
      },
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
    if (!req.file || !req.body.pin)
      return res.status(400).json({ error: "File and PIN required" });

    const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);

    const pinHash = await bcrypt.hash(req.body.pin, 10);

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
      accessUrl: `${process.env.FRONTEND_BASE_URL}/access/${fileDoc._id}`,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err.message);
    res
      .status(500)
      .json({ error: "Upload failed (file too large or unsupported)" });
  }
});

module.exports = router;
