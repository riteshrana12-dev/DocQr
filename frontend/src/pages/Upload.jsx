import { useState } from "react";
import API from "../services/api";
import "./Upload.css";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [pin, setPin] = useState("");

  const [qr, setQr] = useState(null);
  const [link, setLink] = useState("");

  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file || !pin) {
      setError("File and PIN are required");
      return;
    }

    // 🔁 RESET STATE FOR NEW UPLOAD
    setError("");
    setQr(null);
    setLink("");
    setProgress(0);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("pin", pin);

    try {
      const res = await API.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // 📊 REAL upload progress
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setProgress(percent);
        },
      });

      // ✅ ENSURE progress is complete BEFORE showing QR
      setProgress(100);

      // ✅ ONLY NOW show QR (valid & correct)
      setQr(res.data.qrCode);
      setLink(res.data.accessUrl);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
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

      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {/* 📊 Progress Bar */}
      {uploading && (
        <div className="progress-wrapper">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p>{progress}%</p>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {/* ✅ QR appears ONLY when upload is complete */}
      {progress === 100 && qr && (
        <div className="qr-section fade-in">
          <img src={qr} alt="QR Code" />
          <p className="link">{link}</p>
        </div>
      )}
    </div>
  );
}
