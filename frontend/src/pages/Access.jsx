import { useParams } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";
import "../styles/SharedDark.css";

export default function Access() {
  const { id } = useParams();

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [accessUrl, setaccessUrl] = useState("");
  const [fileName, setFileName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post(`/access/${id}`, { pin });

      // ✅ backend sends JSON
      setaccessUrl(res.data.downloadUrl);
      setFileName(res.data.fileName);
    } catch (err) {
      setError(err.response?.data?.error || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        {!accessUrl ? (
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

            <p className="file-name">{fileName}</p>

            <a
              href={accessUrl}
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
