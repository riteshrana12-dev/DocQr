import { useParams } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";
import "../styles/SharedDark.css";

export default function Access() {
  const { id } = useParams();

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post(
        `/access/${id}`,
        { pin },
        {
          responseType: "blob", // 🔥 IMPORTANT — expect FILE, not JSON
        }
      );

      // 📦 Create downloadable file
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);

      // 🔽 Auto-download
      const a = document.createElement("a");
      a.href = url;

      // Try to extract filename from headers
      const contentDisposition = res.headers["content-disposition"];
      let filename = "downloaded-file";

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Access error:", err);

      // If backend returned JSON error instead of file
      if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const json = JSON.parse(text);
          setError(json.error || "Access denied");
        } catch {
          setError("Access failed");
        }
      } else {
        setError(err.response?.data?.error || "Network error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
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
            {loading ? "Verifying…" : "Unlock & Download"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
