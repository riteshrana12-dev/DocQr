import { useState } from "react";
import API from "../services/api";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [pin, setPin] = useState("");
  const [qr, setQr] = useState("");
  const [link, setLink] = useState("");

  const handleUpload = async () => {
    if (!file || !pin) {
      alert("File & PIN required");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("pin", pin);

    const res = await API.post("/upload", formData);

    setQr(res.data.qrCode);
    setLink(res.data.accessUrl);
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

      {qr && (
        <div className="qr-section">
          <img src={qr} alt="QR Code" />
          <p className="link">{link}</p>
        </div>
      )}
    </div>
  );
}
