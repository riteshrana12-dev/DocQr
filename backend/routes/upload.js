const express = require("express");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const QRCode = require("qrcode");
const File = require("../models/File");
const cloudinary = require("../utils/cloudinary");

const router = express.Router();

/* 📦 Multer (memory storage for cloud upload) */
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/* 🔐 Secure Upload */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { pin } = req.body;

    if (!req.file || !pin) {
      return res.status(400).json({ error: "File and PIN required" });
    }

    /* 🔐 Hash PIN */
    const pinHash = await bcrypt.hash(pin, 10);

    /* ☁️ Upload to Cloudinary */
    const uploadResult = await cloudinary.uploader.upload_stream(
      {
        folder: "docqr",
        resource_type: "raw",
      },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary error:", error);
          return res.status(500).json({ error: "Upload failed" });
        }

        /* 🧾 Save to DB */
        const fileDoc = await File.create({
          originalName: req.file.originalname,
          fileUrl: result.secure_url,
          size: req.file.size,
          pinHash,
        });

        /* 🔗 Frontend URL */
        const accessUrl = `${process.env.FRONTEND_BASE_URL}/access/${fileDoc._id}`;

        /* 📷 QR Code */
        const qrCode = await QRCode.toDataURL(accessUrl);

        res.json({
          message: "File uploaded securely",
          fileId: fileDoc._id,
          accessUrl,
          qrCode,
        });
      }
    );

    uploadResult.end(req.file.buffer);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
