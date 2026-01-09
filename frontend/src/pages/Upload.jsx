import { useState } from "react";
import API from "../services/api";
import QRCode from "qrcode";
import "./Shared.css";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [pin, setPin] = useState("");

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [qr, setQr] = useState("");
  const [accessUrl, setAccessUrl] = useState("");
  const [qrReady, setQrReady] = useState(false);

  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file || !pin) {
      setError("File and PIN are required");
      return;
    }

    // reset
    setUploading(true);
    setProgress(0);
    setQr("");
    setAccessUrl("");
    setQrReady(false);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("pin", pin);

    try {
      const res = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },

        // ⏳ Upload progress → max 90%
        onUploadProgress: (e) => {
          if (!e.total) return;
          const percent = Math.min(Math.round((e.loaded / e.total) * 90), 90);
          setProgress(percent);
        },
      });

      // Backend finished → now generate QR
      const url = res.data.accessUrl;

      const qrData = await QRCode.toDataURL(url, {
        width: 240,
        margin: 2,
      });

      setQr(qrData);
      setAccessUrl(url);

      // ✅ FINAL STEP
      setProgress(100);
      setQrReady(true);
    } catch (err) {
      console.error(err);
      setError("Upload failed. Try again.");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h2>Secure File Upload</h2>

        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <input
          type="password"
          placeholder="Enter PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />

        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? "Uploading…" : "Upload"}
        </button>

        {error && <p className="error">{error}</p>}

        {(uploading || qrReady) && (
          <div className="qr-wrapper">
            {/* 🦴 Skeleton */}
            {!qrReady && (
              <>
                <div className="qr-skeleton shimmer" />
                <p className="progress-text">{progress}%</p>
              </>
            )}

            {/* ✅ Real QR */}
            {qrReady && (
              <>
                <img src={qr} alt="QR Code" className="qr-image" />
                <p className="progress-text">100%</p>
                <a
                  href={accessUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="access-link"
                >
                  {accessUrl}
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
