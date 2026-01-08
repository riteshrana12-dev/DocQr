const express = require("express");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");
const QRCode = require("qrcode");
const File = require("../models/File");

const router = express.Router();

/* ============================
   MULTER CONFIG
============================ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

/* ============================
   SECURE UPLOAD + QR
============================ */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { pin } = req.body;

    if (!req.file || !pin) {
      return res.status(400).json({ error: "File and PIN required" });
    }

    /* 🔐 HASH PIN */
    const pinHash = await bcrypt.hash(pin, 10);

    /* ⏳ EXPIRY: 24 HOURS */
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    /* 📦 SAVE FILE */
    const fileDoc = await File.create({
      originalName: req.file.originalname,
      storedName: req.file.filename,
      pinHash,
      size: req.file.size, // 📄 file size
      attemptsLeft: 3, // 🔒 max attempts
      expiresAt, // ⏳ expiry
    });

    /* 🔗 ACCESS URL */
    const accessUrl = `${process.env.FRONTEND_BASE_URL}/access/${fileDoc._id}`;

    /* 📷 QR CODE */
    const qrCode = await QRCode.toDataURL(accessUrl);

    res.json({
      message: "File uploaded securely",
      fileId: fileDoc._id,
      accessUrl,
      qrCode,
      expiresAt,
      attemptsLeft: fileDoc.attemptsLeft,
      fileName: fileDoc.originalName,
      fileSize: fileDoc.size,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
