const express = require("express");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");
const QRCode = require("qrcode");
const File = require("../models/File");

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

// Secure upload + QR
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { pin } = req.body;

    if (!req.file || !pin) {
      return res.status(400).json({ error: "File and PIN required" });
    }

    const pinHash = await bcrypt.hash(pin, 10);

    const fileDoc = await File.create({
      originalName: req.file.originalname,
      storedName: req.file.filename,
      pinHash,
    });

    // Generate QR
    const accessUrl = `${process.env.FRONTEND_BASE_URL}/access/${fileDoc._id}`;

    const qrCode = await QRCode.toDataURL(accessUrl);

    res.json({
      message: "File uploaded securely",
      fileId: fileDoc._id,
      accessUrl,
      qrCode,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
