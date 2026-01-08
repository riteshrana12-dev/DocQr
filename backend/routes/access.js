const express = require("express");
const bcrypt = require("bcryptjs");
const File = require("../models/File");
const axios = require("axios");

const router = express.Router();

/* 🔓 Access File */
router.post("/:id", async (req, res) => {
  try {
    const { pin } = req.body;
    const fileId = req.params.id;

    if (!pin) {
      return res.status(400).json({ error: "PIN required" });
    }

    const fileDoc = await File.findById(fileId);

    if (!fileDoc) {
      return res.status(404).json({ error: "File not found" });
    }

    /* ⏳ Expiry check */
    if (fileDoc.expiresAt && new Date() > fileDoc.expiresAt) {
      return res.status(410).json({ error: "File expired" });
    }

    /* 🔒 Attempt limit */
    if (fileDoc.attemptsLeft <= 0) {
      return res.status(403).json({ error: "Too many incorrect attempts" });
    }

    /* 🔐 PIN verify */
    const isMatch = await bcrypt.compare(pin, fileDoc.pinHash);

    if (!isMatch) {
      fileDoc.attemptsLeft -= 1;
      await fileDoc.save();

      return res.status(401).json({
        error: `Invalid PIN (${fileDoc.attemptsLeft} attempts left)`,
      });
    }

    /* 📦 Download from Cloudinary */
    const response = await axios.get(fileDoc.fileUrl, {
      responseType: "stream",
    });

    /* 📄 Headers for frontend UI */
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileDoc.originalName}"`
    );
    res.setHeader("X-Filename", fileDoc.originalName);
    res.setHeader("X-Filesize", fileDoc.size);

    response.data.pipe(res);
  } catch (err) {
    console.error("Access error:", err);
    res.status(500).json({ error: "Access failed" });
  }
});

module.exports = router;
