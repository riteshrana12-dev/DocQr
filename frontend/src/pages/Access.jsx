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
          responseType: "blob", // 🔥 MUST be blob
          transformResponse: (r) => r, // 🔥 disable axios JSON parsing
          validateStatus: () => true, // 🔥 handle errors manually
        }
      );

      // ❌ Backend returned JSON error (wrong PIN, expired, etc.)
      const contentType = res.headers["content-type"];

      if (contentType?.includes("application/json")) {
        const text = await res.data.text();
        const json = JSON.parse(text);
        setError(json.error || "Access denied");
        return;
      }

      // ✅ FILE RESPONSE
      const blob = new Blob([res.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      // 🔽 Extract filename safely
      let filename = "download";
      const disposition = res.headers["content-disposition"];

      if (disposition) {
        const match = disposition.match(
          /filename\*=UTF-8''(.+)|filename="(.+)"/
        );
        filename = decodeURIComponent(match?.[1] || match?.[2] || filename);
      }

      // 🔽 Trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Access error:", err);
      setError("Network error");
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
