import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Access.css";

export default function Access() {
  const { id } = useParams();

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [blobUrl, setBlobUrl] = useState("");
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.body.className = dark ? "dark" : "light";
  }, [dark]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/access/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        setLoading(false);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      setBlobUrl(url);
      setFileInfo({
        name: res.headers.get("X-Filename"),
        size: (res.headers.get("X-Filesize") / 1024).toFixed(1) + " KB",
      });
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileInfo.name;
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <div className="access-page">
      <div className="card slide-up">
        <div className="theme-toggle" onClick={() => setDark(!dark)}>
          {dark ? "🌙" : "☀️"}
        </div>

        {!fileInfo ? (
          <>
            <h2>🔐 Secure Access</h2>
            <p>Enter PIN to unlock file</p>

            <form onSubmit={handleSubmit}>
              <input
                type="password"
                placeholder="PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />
              <button disabled={loading}>
                {loading ? "Checking..." : "Unlock"}
              </button>
            </form>

            {error && <p className="error">{error}</p>}
          </>
        ) : (
          <>
            <h2>📄 File Ready</h2>
            <p>{fileInfo.name}</p>
            <p>{fileInfo.size}</p>

            <button className="download" onClick={download}>
              ⬇ Download
            </button>
          </>
        )}
      </div>
    </div>
  );
}
