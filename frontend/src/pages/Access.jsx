import { useParams } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";
import "../styles/SharedDark.css";

export default function Access() {
  const { id } = useParams();

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [downloadUrl, setDownloadUrl] = useState("");
  const [fileName, setFileName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post(`/access/${id}`, { pin });

      if (!res.data.success || !res.data.downloadUrl) {
        console.log("Invalid response:", res.data);
        setError(res.data.error || "Access denied");
        setLoading(false);
        return;
      }

      setDownloadUrl(res.data.downloadUrl);
      setFileName(res.data.fileName);
    } catch (err) {
      console.error("Access error:", err);
      setError(err.response?.data?.error || err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        {!downloadUrl ? (
          <>
            <h2>🔐 Secure Access</h2>

            <form onSubmit={handleSubmit}>
              <input
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />

              <button type="submit" disabled={loading}>
                {loading ? "Verifying…" : "Unlock"}
              </button>
            </form>

            {error && <p className="error">{error}</p>}
          </>
        ) : (
          <>
            <h2>📄 File Ready</h2>
            <p>{fileName}</p>

            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="access-link"
            >
              ⬇ Download File
            </a>
          </>
        )}
      </div>
    </div>
  );
}
