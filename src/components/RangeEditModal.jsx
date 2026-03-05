import { useState, useEffect } from "react";

const ALL_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function RangeEditModal({ range, onSave, onClose }) {
  const [startMonth, setStartMonth] = useState("Mar");
  const [endMonth, setEndMonth] = useState("Aug");
  const [year, setYear] = useState(2026);

  useEffect(() => {
    if (!range?.months?.length) return;
    setStartMonth(range.months[0] ?? "Mar");
    setEndMonth(range.months[range.months.length - 1] ?? "Aug");
    setYear(range.year ?? 2026);
  }, [range]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const startIdx = ALL_MONTHS.indexOf(startMonth);
    const endIdx = ALL_MONTHS.indexOf(endMonth);
    if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) return;
    const months = ALL_MONTHS.slice(startIdx, endIdx + 1);
    onSave(months, year);
    onClose();
  };

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
          maxWidth: 360,
          width: "90%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
          Edit timeline range
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Start month
              </label>
              <select
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              >
                {ALL_MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
                End month
              </label>
              <select
                value={endMonth}
                onChange={(e) => setEndMonth(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              >
                {ALL_MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Year
            </label>
            <input
              type="number"
              min={2020}
              max={2030}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
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
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 18px", border: "1.5px solid #e2e8f0", background: "white", borderRadius: 8, fontSize: 13, fontWeight: 700, color: "#64748b", cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit" style={{ padding: "10px 18px", border: "none", background: "#6366f1", borderRadius: 8, fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer" }}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
