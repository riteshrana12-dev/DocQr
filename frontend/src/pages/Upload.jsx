import { useState } from "react";
import API from "../services/api";
import QRCode from "qrcode";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [pin, setPin] = useState("");
  const [qr, setQr] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const handleUpload = async () => {
    setError("");
    setProgress(0);

    if (!file || !pin) {
      setError("File and PIN are required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pin", pin);

      const res = await API.post("/upload", formData, {
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setProgress(percent);
        },
      });

      const accessUrl = res.data.downloadUrl || res.data.accessUrl;

      setLink(accessUrl);

      // ⚡ Instant QR generation (no backend delay)
      const qrImage = await QRCode.toDataURL(accessUrl);
      setQr(qrImage);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Upload failed");
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

      <button onClick={handleUpload}>Upload</button>

      {progress > 0 && <p>Uploading: {progress}%</p>}

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
