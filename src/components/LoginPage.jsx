import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage({ onSuccess }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: err } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (err) {
      setError(err.message || "Sign in failed");
      return;
    }
    onSuccess?.();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        fontFamily: "'DM Sans', sans-serif",
        padding: 16,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          padding: "clamp(20px, 5vw, 32px)",
          width: "100%",
          maxWidth: 360,
          boxSizing: "border-box",
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 8px", color: "#0f172a" }}>
          Editor sign in
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 24px" }}>
          Use your account to edit capacity data.
        </p>
        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1.5px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 14,
              marginBottom: 16,
              boxSizing: "border-box",
            }}
          />
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1.5px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 14,
              marginBottom: 20,
              boxSizing: "border-box",
            }}
          />
          {error && (
            <p style={{ color: "#dc2626", fontSize: 13, margin: "0 0 12px" }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "#6366f1",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
          <button
            type="button"
            onClick={() => onSuccess?.()}
            style={{
              marginTop: 12,
              width: "100%",
              padding: "10px 16px",
              background: "none",
              color: "#64748b",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            ← Back to view
          </button>
        </form>
      </div>
    </div>
  );
}
