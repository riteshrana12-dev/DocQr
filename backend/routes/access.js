const express = require("express");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const File = require("../models/File");

const router = express.Router();

router.post("/:id", async (req, res) => {
  try {
    const { pin } = req.body;
    const file = await File.findById(req.params.id);

    if (!file) return res.status(404).json({ error: "File not found" });
    if (file.expiresAt && new Date() > file.expiresAt)
      return res.status(410).json({ error: "File expired" });
    if (file.attemptsLeft <= 0)
      return res.status(403).json({ error: "Too many attempts" });

    const isMatch = await bcrypt.compare(pin, file.pinHash);
    if (!isMatch) {
      file.attemptsLeft -= 1;
      await file.save();
      return res.status(401).json({
        error: `Invalid PIN (${file.attemptsLeft} attempts left)`,
      });
    }

    // 🔥 FETCH FILE FROM CLOUDINARY
    const response = await axios.get(file.cloudinaryUrl, {
      responseType: "stream",
    });

    // ✅ IMPORTANT HEADERS
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.originalName}"`
    );
    res.setHeader("Content-Type", response.headers["content-type"]);

    // 🚀 STREAM FILE
    response.data.pipe(res);
  } catch (err) {
    console.error("Access error:", err);
    res.status(500).json({ error: "Access failed" });
  }
});

module.exports = router;
