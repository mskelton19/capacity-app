import { useState, useEffect, useMemo } from "react";

const DEFAULT_NEW_COLOR = "#64748b";

const MONTH_ABBREV_TO_JS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

function getTimelineRange(monthLabels, year, count) {
  if (!Array.isArray(monthLabels) || monthLabels.length === 0 || !year) return null;
  const firstJs = MONTH_ABBREV_TO_JS[monthLabels[0]];
  if (firstJs === undefined) return null;
  const start = new Date(year, firstJs, 1);
  const end = new Date(year, firstJs + count, 0);
  return { start, end };
}

function dateToIndex(date, range, monthCount) {
  if (!range) return 0;
  const t = date.getTime();
  const s = range.start.getTime();
  const e = range.end.getTime() + 1;
  return Math.max(0, Math.min(monthCount, ((t - s) / (e - s)) * monthCount));
}

function indexToDate(index, range, monthCount) {
  if (!range) return new Date();
  const s = range.start.getTime();
  const e = range.end.getTime() + 1;
  const t = s + (index / monthCount) * (e - s);
  return new Date(t);
}

function formatDateForInput(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function TrackEditModal({ track, monthCount, months: monthLabels, year, onSave, onClose, onDelete, isCreate }) {
  const creating = Boolean(isCreate || track?.isNew);
  const range = useMemo(() => getTimelineRange(monthLabels, year, monthCount), [monthLabels, year, monthCount]);
  const [label, setLabel] = useState("");
  const [startDateStr, setStartDateStr] = useState("");
  const [endDateStr, setEndDateStr] = useState("");
  const [atRisk, setAtRisk] = useState(false);

  const minDateStr = range ? formatDateForInput(range.start) : "";
  const maxDateStr = range ? formatDateForInput(range.end) : "";

  useEffect(() => {
    if (!track) return;
    if (track.isNew) {
      setLabel("");
      if (range) {
        setStartDateStr(formatDateForInput(range.start));
        const endOfFirstMonth = new Date(indexToDate(1, range, monthCount).getTime() - 86400000);
        setEndDateStr(formatDateForInput(endOfFirstMonth));
      } else {
        setStartDateStr("");
        setEndDateStr("");
      }
      setAtRisk(false);
      return;
    }
    setLabel(track.label ?? "");
    if (range) {
      const start = typeof track.start === "number" ? Math.max(0, Math.min(track.start, monthCount)) : 0;
      const end = typeof track.end === "number" ? Math.max(0, Math.min(track.end, monthCount)) : 1;
      setStartDateStr(formatDateForInput(indexToDate(start, range, monthCount)));
      const endMoment = indexToDate(end, range, monthCount);
      const lastDayIncluded = new Date(endMoment.getTime() - 86400000);
      setEndDateStr(formatDateForInput(lastDayIncluded));
    } else {
      setStartDateStr("");
      setEndDateStr("");
    }
    setAtRisk(Boolean(track.atRisk));
  }, [track, monthCount, range]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedLabel = label.trim();
    if (creating && !trimmedLabel) return;
    if (!range || !startDateStr || !endDateStr) return;
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    if (endDate < startDate) return;
    const start = dateToIndex(startDate, range, monthCount);
    const endDateExclusive = new Date(endDate.getTime() + 86400000);
    const end = dateToIndex(endDateExclusive, range, monthCount);
    if (end <= start) return;
    onSave({
      label: trimmedLabel || track?.label,
      start: Math.max(0, Math.min(start, monthCount)),
      end: Math.max(0, Math.min(end, monthCount)),
      atRisk,
      ...(creating && { color: DEFAULT_NEW_COLOR }),
    });
    onClose();
  };

  if (!track && !creating) return null;

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
          {creating ? "Add project" : "Edit timeline"}
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
              required={creating}
            />
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Start date
              </label>
              <input
                type="date"
                min={minDateStr}
                max={maxDateStr}
                value={startDateStr}
                onChange={(e) => {
                  const v = e.target.value;
                  setStartDateStr(v);
                  if (v && endDateStr && new Date(v) >= new Date(endDateStr)) {
                    const next = new Date(v);
                    next.setDate(next.getDate() + 1);
                    if (next <= new Date(maxDateStr)) setEndDateStr(formatDateForInput(next));
                  }
                }}
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
                End date
              </label>
              <input
                type="date"
                min={minDateStr}
                max={maxDateStr}
                value={endDateStr}
                onChange={(e) => setEndDateStr(e.target.value)}
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
          <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center" }}>
            <div>
              {!creating && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this project?")) {
                      onDelete();
                      onClose();
                    }
                  }}
                  style={{
                    padding: "10px 18px",
                    border: "1.5px solid #fca5a5",
                    background: "#fef2f2",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#dc2626",
                    cursor: "pointer",
                  }}
                >
                  Delete project
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
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
                {creating ? "Add project" : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
