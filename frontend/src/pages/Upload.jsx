import { useState } from "react";
import API from "../services/api";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [pin, setPin] = useState("");
  const [qr, setQr] = useState("");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");

  const handleUpload = async () => {
    setError("");

    if (!file || !pin) {
      setError("File and PIN are required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pin", pin);

      const res = await API.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setQr(res.data.qrCode);
      setLink(res.data.accessUrl);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Upload failed. Try again.");
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
