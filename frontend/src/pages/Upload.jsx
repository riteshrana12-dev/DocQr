import { useState } from "react";
import axios from "axios";
import QRCode from "qrcode";
import "./Upload.css";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [pin, setPin] = useState("");

  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [qr, setQr] = useState("");
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file || !pin) {
      setError("File and PIN are required");
      return;
    }

    // 🔄 RESET EVERYTHING FOR NEW UPLOAD
    setError("");
    setQr("");
    setProgress(0);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("pin", pin);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },

          // ⏳ Upload progress (max 90%)
          onUploadProgress: (e) => {
            if (!e.total) return;
            const percent = Math.round((e.loaded * 90) / e.total);
            setProgress(percent);
          },
        }
      );

      // ✅ BACKEND RESPONSE RECEIVED
      // ⏳ Finalizing (90 → 100)
      setProgress(100);

      // ✅ Generate QR ONLY NOW (SYNC POINT)
      const qrDataUrl = await QRCode.toDataURL(res.data.accessUrl);
      setQr(qrDataUrl);
    } catch (err) {
      console.error(err);
      setError("Upload failed. Try again.");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container">
      <h2>Secure File Upload</h2>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <input
        type="password"
        placeholder="Enter PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
      />

      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {/* ⏳ Progress Bar */}
      {uploading && (
        <div className="progress-wrapper">
          <div className="progress-bar">
            <div style={{ width: `${progress}%` }} />
          </div>
          <p>{progress}%</p>
          {progress < 100 && <p>Uploading & processing…</p>}
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {/* ✅ QR APPEARS ONLY WHEN PROGRESS = 100 AND QR EXISTS */}
      {progress === 100 && qr && (
        <div className="qr-section">
          <img src={qr} alt="QR Code" />
          <p>Scan to access file</p>
        </div>
      )}
    </div>
  );
}
