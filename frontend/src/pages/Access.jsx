import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Access.css";

export default function Access() {
  const { id } = useParams();

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [fileInfo, setFileInfo] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState("");

  const [darkMode, setDarkMode] = useState(true);

  /* 🌗 Dark / Light mode */
  useEffect(() => {
    document.body.className = darkMode ? "dark" : "light";
  }, [darkMode]);

  /* 🔓 Submit PIN */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/access/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Access denied");
        setLoading(false);
        return;
      }

      /* ✅ Cloudinary response */
      setFileInfo({
        name: data.fileName,
      });
      setDownloadUrl(data.downloadUrl);
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  /* ⬇ Download via Cloudinary */
  const downloadFile = () => {
    window.open(downloadUrl, "_blank");
  };

  return (
    <div className="access-page">
      <div className="access-card slide-up">
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "🌙" : "☀️"}
        </button>

        {!fileInfo ? (
          <>
            <h2>🔐 Secure Access</h2>
            <p className="subtitle">Enter PIN to unlock file</p>

            <form onSubmit={handleSubmit}>
              <input
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />

              <button type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Unlock"}
              </button>
            </form>

            {error && <p className="error">{error}</p>}
          </>
        ) : (
          <>
            <h2>📄 File Ready</h2>

            <div className="file-info">
              <p>
                <strong>Name:</strong> {fileInfo.name}
              </p>
            </div>

            <button className="download-btn" onClick={downloadFile}>
              ⬇ Download
            </button>
          </>
        )}
      </div>
    </div>
  );
}
