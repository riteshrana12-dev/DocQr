const express = require("express");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const QRCode = require("qrcode");
const cloudinary = require("../utils/cloudinary");
const File = require("../models/File");

const router = express.Router();
const upload = multer({ dest: "temp/" });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { pin } = req.body;
    if (!req.file || !pin) {
      return res.status(400).json({ error: "File & PIN required" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
    });

    const pinHash = await bcrypt.hash(pin, 10);

    const fileDoc = await File.create({
      originalName: req.file.originalname,
      cloudinaryUrl: result.secure_url,
      pinHash,
    });

    const accessUrl = `${process.env.FRONTEND_BASE_URL}/access/${fileDoc._id}`;
    const qrCode = await QRCode.toDataURL(accessUrl);

    res.json({
      message: "Upload success",
      qrCode,
      accessUrl,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
