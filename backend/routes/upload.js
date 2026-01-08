const express = require("express");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const File = require("../models/File");
const cloudinary = require("../utils/cloudinary");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { pin } = req.body;
    if (!req.file || !pin) {
      return res.status(400).json({ error: "File and PIN required" });
    }

    /* ☁ Upload to Cloudinary */
    const uploadResult = await cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      async (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ error: "Upload failed" });
        }

        const pinHash = await bcrypt.hash(pin, 10);

        const fileDoc = await File.create({
          originalName: req.file.originalname,
          cloudinaryUrl: result.secure_url,
          size: req.file.size,
          pinHash,
          attemptsLeft: 5,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        });

        /* ⚡ FAST RESPONSE */
        return res.json({
          success: true,
          fileId: fileDoc._id,
          accessUrl: `${process.env.FRONTEND_BASE_URL}/access/${fileDoc._id}`,
        });
      }
    );

    uploadResult.end(req.file.buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
