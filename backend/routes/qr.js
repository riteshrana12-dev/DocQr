const express = require("express");
const QRCode = require("qrcode");

const router = express.Router();

router.get("/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;

    const accessUrl = `http://localhost:3000/access/${fileId}`;

    const qr = await QRCode.toDataURL(accessUrl);

    res.json({
      fileId,
      qr,
      accessUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "QR generation failed" });
  }
});

module.exports = router;
