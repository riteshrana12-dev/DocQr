import { useState } from "react";
import API from "../services/api";
import QRCode from "qrcode";
import "./Upload.css";

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

    // 🔄 RESET
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

        onUploadProgress: (e) => {
          if (!e.total) return;
          const percent = Math.round((e.loaded / e.total) * 100);
          setProgress(percent);
        },
      });

      // ✅ Backend response received
      const url = res.data.accessUrl;

      // Generate REAL QR
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 240,
        margin: 2,
      });

      setQr(qrDataUrl);
      setAccessUrl(url);
      setQrReady(true);
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
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
        {uploading ? "Uploading…" : "Upload"}
      </button>

      {error && <p className="error">{error}</p>}

      {/* 🔳 QR AREA */}
      {(uploading || qrReady) && (
        <div className="qr-wrapper">
          {/* ⏳ DUMMY QR */}
          {!qrReady && (
            <>
              <div className="qr-dummy">
                {Array.from({ length: 21 * 21 }).map((_, i) => (
                  <div key={i} className="qr-dummy-cell" />
                ))}
              </div>
              <p className="progress-text">
                Uploading & processing… {progress}%
              </p>
            </>
          )}

          {/* ✅ REAL QR */}
          {qrReady && (
            <div className="qr-section">
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
