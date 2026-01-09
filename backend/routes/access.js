const express = require("express");
const bcrypt = require("bcryptjs");
const File = require("../models/File");

const router = express.Router();

router.post("/:id", async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json({ error: "PIN required" });
    }

    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    if (file.expiresAt && new Date() > file.expiresAt) {
      return res.status(410).json({ error: "File expired" });
    }

    if (file.attemptsLeft <= 0) {
      return res.status(403).json({ error: "Too many attempts" });
    }

    const isMatch = await bcrypt.compare(pin, file.pinHash);

    if (!isMatch) {
      file.attemptsLeft -= 1;
      await file.save();
      return res.status(401).json({
        error: `Invalid PIN (${file.attemptsLeft} attempts left)`,
      });
    }

    // ✅ ALWAYS JSON — NEVER FILE
    return res.json({
      success: true,
      fileName: file.originalName,
      downloadUrl: file.cloudinaryUrl,
    });
  } catch (err) {
    console.error("Access error:", err);
    return res.status(500).json({ error: "Access failed" });
  }
});

module.exports = router;
