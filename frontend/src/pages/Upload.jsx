import { useState } from "react";
import axios from "axios";
import "./Upload.css";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [pin, setPin] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [qr, setQr] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file || !pin) {
      setError("File and PIN are required");
      return;
    }

    // RESET state for new upload
    setError("");
    setQr("");
    setLink("");
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
          headers: {
            "Content-Type": "multipart/form-data",
          },

          // 🔥 REAL upload progress
          onUploadProgress: (event) => {
            if (event.total) {
              const percent = Math.round((event.loaded * 100) / event.total);
              setProgress(percent);
            }
          },
        }
      );

      // ✅ Only here upload is COMPLETE
      setProgress(100);
      setQr(res.data.qrCode);
      setLink(res.data.accessUrl);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Upload failed");
      setProgress(0);
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

      {/* 🔄 Progress Bar */}
      {uploading && (
        <div className="progress-wrapper">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p>{progress}%</p>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {/* ✅ QR only when upload + response done */}
      {progress === 100 && qr && (
        <div className="qr-section fade-in">
          <img src={qr} alt="QR Code" />
          <p className="link">{link}</p>
        </div>
      )}
    </div>
  );
}
