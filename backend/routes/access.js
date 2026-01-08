const express = require("express");
const bcrypt = require("bcryptjs");
const path = require("path");
const File = require("../models/File");

const router = express.Router();

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

    /* ⏳ EXPIRY CHECK */
    if (fileDoc.expiresAt && new Date() > fileDoc.expiresAt) {
      return res.status(410).json({ error: "File expired" });
    }

    /* 🔒 ATTEMPT LIMIT */
    if (fileDoc.attemptsLeft !== undefined && fileDoc.attemptsLeft <= 0) {
      return res.status(403).json({ error: "Too many incorrect attempts" });
    }

    /* 🔐 PIN VERIFY */
    const isMatch = await bcrypt.compare(pin, fileDoc.pinHash);

    if (!isMatch) {
      if (fileDoc.attemptsLeft !== undefined) {
        fileDoc.attemptsLeft -= 1;
        await fileDoc.save();
      }

      return res.status(401).json({
        error:
          fileDoc.attemptsLeft !== undefined
            ? `Invalid PIN (${fileDoc.attemptsLeft} attempts left)`
            : "Invalid PIN",
      });
    }

    /* 📄 FILE PATH */
    const filePath = path.join(__dirname, "../uploads", fileDoc.storedName);

    /* 📦 METADATA HEADERS (for frontend UI) */
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileDoc.originalName}"`
    );
    res.setHeader("X-Filename", fileDoc.originalName);
    res.setHeader("X-Filesize", fileDoc.size || 0);

    return res.sendFile(path.resolve(filePath));
  } catch (err) {
    console.error("Access error:", err);
    res.status(500).json({ error: "Access failed" });
  }
});

module.exports = router;
