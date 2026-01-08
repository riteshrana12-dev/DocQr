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

    const isMatch = await bcrypt.compare(pin, fileDoc.pinHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid PIN" });
    }

    const filePath = path.join(__dirname, "../uploads", fileDoc.storedName);

    return res.download(filePath, fileDoc.originalName);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Access failed" });
  }
});

module.exports = router;
