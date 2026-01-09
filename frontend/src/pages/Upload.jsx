import { useState } from "react";
import API from "../services/api";
import QRCode from "qrcode";
import "./Upload.css";

const QR_SIZE = 21 * 21; // QR v1 grid

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

    // 🔄 RESET STATE
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

        // ⏳ Upload progress (0 → 90)
        onUploadProgress: (e) => {
          if (!e.total) return;
          const percent = Math.min(Math.round((e.loaded / e.total) * 90), 90);
          setProgress(percent);
        },
      });

      // ✅ Backend finished
      const url = res.data.accessUrl;

      // 🎯 Generate QR ONLY after response
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 240,
        margin: 2,
      });

      setQr(qrDataUrl);
      setAccessUrl(url);

      // 🎉 FINAL STEP
      setProgress(100);
      setQrReady(true);
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  // 🔢 How many QR blocks to reveal
  const visibleCells = Math.floor((progress / 100) * QR_SIZE);

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
        {uploading ? "Uploading…" : "Upload"}
      </button>

      {error && <p className="error">{error}</p>}

      {/* 🔳 QR AREA (RESERVED SPACE) */}
      {progress > 0 && (
        <div className="qr-wrapper">
          {/* ⏳ QR SKELETON */}
          {!qrReady && (
            <>
              <div className="qr-skeleton">
                {Array.from({ length: QR_SIZE }).map((_, i) => (
                  <div
                    key={i}
                    className={`qr-cell ${
                      i < visibleCells ? "qr-cell-filled" : ""
                    }`}
                  />
                ))}
              </div>

              <p className="progress-text">
                Uploading & processing… {progress}%
              </p>
            </>
          )}

          {/* ✅ REAL QR */}
          {qrReady && (
            <div className="qr-section fade-in">
              <img src={qr} alt="QR Code" className="qr-image" />
              <p className="qr-text">Scan or open link</p>

              <a
                href={accessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="access-link"
              >
                {accessUrl}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
