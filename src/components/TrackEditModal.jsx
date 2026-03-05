import { useState, useEffect } from "react";

export default function TrackEditModal({ track, monthCount, onSave, onClose }) {
  const [label, setLabel] = useState("");
  const [startMonth, setStartMonth] = useState(0);
  const [endMonth, setEndMonth] = useState(1);
  const [atRisk, setAtRisk] = useState(false);

  useEffect(() => {
    if (!track) return;
    setLabel(track.label ?? "");
    setStartMonth(typeof track.start === "number" ? Math.max(0, Math.min(track.start, monthCount - 1)) : 0);
    setEndMonth(typeof track.end === "number" ? Math.max(0, Math.min(track.end, monthCount)) : 1);
    setAtRisk(Boolean(track.atRisk));
  }, [track, monthCount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      label: label.trim() || track?.label,
      start: startMonth,
      end: endMonth,
      atRisk,
    });
    onClose();
  };

  if (!track) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          padding: 24,
          maxWidth: 400,
          width: "90%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
          Edit timeline
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1.5px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 14,
                boxSizing: "border-box",
              }}
              placeholder="Project or initiative name"
            />
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Start (month index)
              </label>
              <input
                type="number"
                min={0}
                max={monthCount - 1}
                step={0.1}
                value={startMonth}
                onChange={(e) => setStartMonth(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
                End (month index)
              </label>
              <input
                type="number"
                min={0}
                max={monthCount}
                step={0.1}
                value={endMonth}
                onChange={(e) => setEndMonth(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#475569" }}>
              <input
                type="checkbox"
                checked={atRisk}
                onChange={(e) => setAtRisk(e.target.checked)}
              />
              Mark as at risk / TBD
            </label>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 18px",
                border: "1.5px solid #e2e8f0",
                background: "white",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                color: "#64748b",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "10px 18px",
                border: "none",
                background: "#6366f1",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                color: "white",
                cursor: "pointer",
              }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
