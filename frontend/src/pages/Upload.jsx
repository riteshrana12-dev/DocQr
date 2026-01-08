import { useState } from "react";
import API from "../services/api";
import QRCode from "qrcode";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [pin, setPin] = useState("");
  const [qr, setQr] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    setError("");

    if (!file || !pin) {
      setError("File and PIN are required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("pin", pin);

      /* 🚀 Upload (FAST – no backend QR) */
      const res = await API.post("/upload", formData);

      const accessUrl = res.data.accessUrl;
      setLink(accessUrl);

      /* ⚡ INSTANT QR (Frontend) */
      const qrCode = await QRCode.toDataURL(accessUrl, {
        width: 300,
        margin: 2,
      });

      setQr(qrCode);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>🔐 Secure File Upload</h2>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <input
        type="password"
        placeholder="Enter PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
      />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {qr && (
        <div className="qr-section">
          <img src={qr} alt="QR Code" />
          <p className="link">{link}</p>
        </div>
      )}
    </div>
  );
}
