import { useParams } from "react-router-dom";
import { useState } from "react";
import "../styles/SharedDark.css";

export default function Access() {
  const { id } = useParams();

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [fileUrl, setFileUrl] = useState("");

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
        setError(data.error || "Access denied");
        setLoading(false);
        return;
      }

      const blob = await res.blob();
      setFileUrl(URL.createObjectURL(blob));
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        {!fileUrl ? (
          <>
            <h2>Secure Access</h2>

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
          <a href={fileUrl} download className="access-link">
            ⬇ Download File
          </a>
        )}
      </div>
    </div>
  );
}
