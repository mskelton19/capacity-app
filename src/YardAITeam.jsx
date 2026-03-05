import { useState, useRef } from "react";
import { useTimeline } from "./context/TimelineContext";
import TrackEditModal from "./components/TrackEditModal";
import QuestionEditModal from "./components/QuestionEditModal";
import { useTrackDrag } from "./hooks/useTrackDrag";
import { buildRowsWithOverrides } from "./utils/timelineRows";
import { getQuestionStatusStyle } from "./utils/questionStatus";

const TEAM_SIZE = 4;
const NAME_COL = 80;
const TEAM_ID = "yardai";

const PEOPLE = [
  { name: "Sergio", role: "PM" },
  { name: "James",  role: "AI Eng" },
  { name: "Adam",   role: "AI Eng" },
  { name: "Maggie", role: "Data Sci" },
];

const PHASE_LABELS = [
  { start: 0,   end: 1.0, label: "Foundation",         sublabel: "Yard Status · Chat History · Checkout · Product Recs · Weather", bg: "#f0f9ff", border: "#bae6fd", text: "#0369a1" },
  { start: 1.0, end: 2.77,label: "Sunny intelligence", sublabel: "Seasonality · Specialized Flows · CS Handoff · Gladly",          bg: "#ecfeff", border: "#a5f3fc", text: "#0e7490" },
  { start: 2.77,end: 3.0, label: "",                   sublabel: "",                                                                bg: "#f8fafc", border: "#e2e8f0", text: "#94a3b8" },
  { start: 3.0, end: 6,   label: "Strategic TBD",      sublabel: "Save Tasks + Season Recap",                                      bg: "#f5f3ff", border: "#c4b5fd", text: "#7c3aed" },
];

function nextCommitmentValue(current) {
  const cycle = [false, true, null];
  const i = cycle.indexOf(current);
  return cycle[(i + 1) % 3];
}

function computeCommittedUnknown(commitments, people, monthCount) {
  const byMonth = { committed: [], unknown: [] };
  for (let mi = 0; mi < monthCount; mi++) {
    let committed = 0, unknown = 0;
    people.forEach((p) => {
      const arr = commitments[p.name];
      const v = Array.isArray(arr) ? arr[mi] : undefined;
      if (v === true) committed++;
      else if (v === null) unknown++;
    });
    byMonth.committed.push(committed);
    byMonth.unknown.push(unknown);
  }
  return byMonth;
}

function getColor(pct) {
  if (pct === 0)   return { fill: "#e2e8f0", bg: "#f8fafc", border: "#e2e8f0", text: "#94a3b8", label: "Open" };
  if (pct <= 0.5)  return { fill: "#86efac", bg: "#f0fdf4", border: "#86efac", text: "#16a34a", label: "Available" };
  if (pct <= 0.79) return { fill: "#fde047", bg: "#fefce8", border: "#fde047", text: "#854d0e", label: "Some availability" };
  if (pct < 1.0)   return { fill: "#fb923c", bg: "#fff7ed", border: "#fb923c", text: "#c2410c", label: "Limited" };
  return { fill: "#f87171", bg: "#fef2f2", border: "#f87171", text: "#dc2626", label: "At capacity" };
}

export default function YardAITeam() {
  const { range, tracks, commitments, questions, updateTrack, updateCommitment, addQuestion, updateQuestion } = useTimeline();
  const MONTHS = range.months ?? ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  const monthCount = MONTHS.length;
  const TRACKS = tracks.yardai ?? [];
  const teamCommitments = commitments.yardai ?? {};
  const { committed: committedByMonth, unknown: unknownByMonth } = computeCommittedUnknown(teamCommitments, PEOPLE, monthCount);
  const [editingTrack, setEditingTrack] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const timelineStripRef = useRef(null);
  const teamQuestions = (questions || []).filter((q) => (q.teams || []).includes("yardai"));
  const rowRefs = useRef([]);
  const rows = buildRowsWithOverrides(TRACKS);
  const { draggingTrackId, handleBarPointerDown } = useTrackDrag(
    timelineStripRef,
    monthCount,
    updateTrack,
    (track, didDrag) => { if (!didDrag) setEditingTrack(track); },
    rowRefs
  );

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: "#f8fafc", minHeight: "100vh", padding: "28px 32px", color: "#0f172a", maxWidth: 1200, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Capacity Review · Draft</div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>Yard AI Team</h1>
            <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14 }}>{MONTHS[0]} – {MONTHS[MONTHS.length - 1]} {range.year ?? 2026} &nbsp;·&nbsp; 4 people &nbsp;·&nbsp; 1 PM, 2 AI Eng, 1 Data Sci</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {PEOPLE.map(p => (
              <div key={p.name} style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 700, color: "#334155", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                <span>{p.name}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>{p.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", overflow: "hidden", marginBottom: 20 }}>

        {/* Month headers */}
        <div style={{ display: "flex", borderBottom: "2px solid #e2e8f0", background: "#f8fafc" }}>
          <div style={{ width: NAME_COL, flexShrink: 0 }} />
          <div style={{ flex: 1, display: "flex" }}>
            {MONTHS.map(m => (
              <div key={m} style={{ flex: 1, textAlign: "center", padding: "10px 0", fontSize: 13, fontWeight: 800, color: "#64748b" }}>{m}</div>
            ))}
          </div>
        </div>

        {/* Phase banners */}
        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ width: NAME_COL, flexShrink: 0 }} />
          <div style={{ flex: 1, position: "relative", height: 40 }}>
            {PHASE_LABELS.map((phase, i) => {
              const left = (phase.start / MONTHS.length) * 100;
              const width = ((phase.end - phase.start) / MONTHS.length) * 100;
              return (
                <div key={i} style={{ position: "absolute", left: `${left}%`, width: `${width}%`, top: 0, bottom: 0, background: phase.bg, borderRight: i < PHASE_LABELS.length - 1 ? `2px solid ${phase.border}` : "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: phase.text, whiteSpace: "nowrap" }}>{phase.label}</div>
                  <div style={{ fontSize: 9, color: phase.text, opacity: 0.75, whiteSpace: "nowrap" }}>{phase.sublabel}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gantt */}
        <div style={{ padding: "16px 0 14px", borderBottom: "2px solid #e2e8f0" }}>
          {rows.map((row, ri) => (
            <div key={ri} ref={(el) => { rowRefs.current[ri] = el; }} style={{ display: "flex", marginBottom: ri < rows.length - 1 ? 22 : 8 }}>
              <div style={{ width: NAME_COL, flexShrink: 0 }} />
              <div ref={ri === 0 ? timelineStripRef : null} style={{ flex: 1, position: "relative", height: 36 }}>
                {MONTHS.map((_, i) => i > 0 && (
                  <div key={i} style={{ position: "absolute", left: `${(i / MONTHS.length) * 100}%`, top: 0, bottom: 0, borderLeft: "1px dashed #e2e8f0", pointerEvents: "none" }} />
                ))}
                {row.map(track => {
                  const left = (track.start / MONTHS.length) * 100;
                  const width = ((track.end - track.start) / MONTHS.length) * 100;
                  const barPx = (width / 100) * 1100;
                  const displayLabel = track.atRisk ? `${track.label} (?)` : track.label;
                  const labelPx = displayLabel.length * 6.5 + 20;
                  const labelFits = barPx > labelPx;
                  const isDragging = draggingTrackId === track.id;
                  return (
                    <div key={track.id ?? track.label} style={{ position: "absolute", left: `${left}%`, width: `${width}%`, height: 36 }}>
                      <div
                        onMouseDown={(e) => { e.preventDefault(); handleBarPointerDown(track, TEAM_ID, e); }}
                        onTouchStart={(e) => handleBarPointerDown(track, TEAM_ID, e)}
                        style={{ height: "100%", background: track.atRisk ? "transparent" : track.color, border: track.atRisk ? `2px dashed ${track.color}` : "none", borderRadius: "4px 14px 14px 4px", display: "flex", alignItems: "center", paddingLeft: 12, paddingRight: 20, fontSize: 12, fontWeight: 700, color: track.atRisk ? track.color : "white", whiteSpace: "nowrap", overflow: "hidden", clipPath: track.atRisk ? "none" : "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)", boxShadow: track.atRisk ? "none" : "0 1px 3px rgba(0,0,0,0.12)", cursor: isDragging ? "grabbing" : "grab", userSelect: "none", opacity: isDragging ? 0.9 : 1 }}
                        title="Drag to move, click to edit"
                      >
                        {labelFits ? displayLabel : ""}
                      </div>
                      {!labelFits && (
                        <div style={{ position: "absolute", top: 38, left: 0, fontSize: 10, fontWeight: 700, color: track.color, whiteSpace: "nowrap", background: "white", padding: "1px 4px", borderRadius: 4, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", zIndex: 10, border: `1px solid ${track.color}44` }}>
                          {displayLabel}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Team capacity */}
        <div style={{ padding: "20px 16px 20px 0" }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: "#94a3b8", textTransform: "uppercase", marginBottom: 14, paddingLeft: NAME_COL }}>
            Team Capacity · People with assigned work
          </div>

          {PEOPLE.map(person => (
            <div key={person.name} style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
              <div style={{ width: NAME_COL, flexShrink: 0, paddingLeft: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>{person.name}</span>
                <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, marginLeft: 5 }}>{person.role}</span>
              </div>
              <div style={{ flex: 1, display: "flex", gap: 4 }}>
                {MONTHS.map((_, mi) => {
                  const arr = teamCommitments[person.name];
                  const state = Array.isArray(arr) ? arr[mi] : false;
                  return (
                    <button
                      key={mi}
                      type="button"
                      onClick={() => updateCommitment("yardai", person.name, mi, nextCommitmentValue(state))}
                      style={{ flex: 1, height: 28, borderRadius: 6, background: state === true ? "#1e293b" : state === null ? `repeating-linear-gradient(45deg, #e2e8f0, #e2e8f0 3px, #f8fafc 3px, #f8fafc 6px)` : "#f1f5f9", border: state === null ? "1.5px dashed #cbd5e1" : "1.5px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: state === true ? "white" : "#94a3b8", cursor: "pointer" }}
                      title="Click to cycle: available → committed → unknown"
                    >
                      {state === true ? "●" : state === null ? "?" : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div style={{ borderTop: "1px solid #e2e8f0", margin: "14px 0" }} />

          {/* Summary */}
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div style={{ width: NAME_COL, flexShrink: 0, paddingLeft: 16, fontSize: 11, fontWeight: 800, color: "#475569", paddingTop: 20 }}>Summary</div>
            <div style={{ flex: 1, display: "flex", gap: 4 }}>
              {MONTHS.map((_, mi) => {
                const committed = committedByMonth[mi];
                const unknown = unknownByMonth[mi];
                const pct = committed / TEAM_SIZE;
                const c = getColor(pct);
                return (
                  <div key={mi} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ height: 16, display: "flex", justifyContent: "center" }}>
                      {unknown > 0 && <div style={{ fontSize: 9, fontWeight: 800, color: "#64748b", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 10, padding: "1px 6px" }}>+{unknown}?</div>}
                    </div>
                    <div style={{ borderRadius: 10, border: `1.5px solid ${c.border}`, background: c.bg, padding: "10px 8px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <div style={{ width: "100%", height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${Math.min(pct * 100, 100)}%`, height: "100%", background: c.fill, borderRadius: 3 }} />
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                        <span style={{ fontSize: 20, fontWeight: 900, color: c.text, lineHeight: 1 }}>{committed}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: c.text, opacity: 0.6 }}>/ {TEAM_SIZE}</span>
                      </div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: c.text, opacity: 0.8, textTransform: "uppercase", letterSpacing: 0.5 }}>{c.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Open Questions */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#94a3b8", textTransform: "uppercase" }}>Open Questions & Risks</div>
          <button type="button" onClick={() => setEditingQuestion({})} style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", background: "none", border: "none", cursor: "pointer" }}>+ Add question</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {teamQuestions.map((q) => {
            const s = getQuestionStatusStyle(q.status);
            return (
              <div key={q.id} style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "13px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#1e293b", marginBottom: 3 }}>{q.question}</div>
                  <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>{q.detail}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span style={{ background: s.bg, color: s.text, fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20, border: `1px solid ${s.border}` }}>{q.status}</span>
                  <button type="button" onClick={() => setEditingQuestion(q)} style={{ fontSize: 11, fontWeight: 700, color: "#64748b", background: "none", border: "none", cursor: "pointer" }}>Edit</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editingTrack && (
        <TrackEditModal
          track={editingTrack}
          monthCount={MONTHS.length}
          onSave={(updates) => updateTrack("yardai", editingTrack.id, updates)}
          onClose={() => setEditingTrack(null)}
        />
      )}

      {editingQuestion && (
        <QuestionEditModal
          question={editingQuestion.id ? editingQuestion : null}
          onSave={(payload) => (editingQuestion.id ? updateQuestion(editingQuestion.id, payload) : addQuestion({ ...payload, teams: payload.teams || ["yardai"] }))}
          onClose={() => setEditingQuestion(null)}
        />
      )}
    </div>
  );
}
