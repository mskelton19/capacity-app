import { useState, useRef } from "react";
import { useTimeline } from "./context/TimelineContext";
import TrackEditModal from "./components/TrackEditModal";
import { useTrackDrag } from "./hooks/useTrackDrag";
import { buildRowsWithOverrides } from "./utils/timelineRows";

const TEAM_SIZE = 2;

const PEOPLE = [
  { name: "Josh", role: "FE" },
  { name: "Matt", role: "FE" },
];

const PHASE_LABELS = [
  { start: 0,   end: 1,   label: "Redlining",     sublabel: "Both engineers at max load", bg: "#fef2f2", border: "#fca5a5", text: "#dc2626" },
  { start: 1,   end: 2.5, label: "Solo coverage", sublabel: "Matt on paternity leave",    bg: "#fffbeb", border: "#fcd34d", text: "#d97706" },
  { start: 2.5, end: 3,   label: "Matt returns",  sublabel: "Mid-late May",               bg: "#f0fdf4", border: "#86efac", text: "#16a34a" },
  { start: 3,   end: 6,   label: "Strategic TBD", sublabel: "Direction needs decision",   bg: "#f5f3ff", border: "#c4b5fd", text: "#7c3aed" },
];

const COMMITMENTS = {
  "Josh": [true, true,  true,  true, true, true],
  "Matt": [true, "leave", "returning", true, true, true],
};

const EFFECTIVE_CAPACITY = [2, 1, 1, 2, 2, 2];

const MONTH_COMMITTED = (monthCount) =>
  Array.from({ length: monthCount }, (_, mi) =>
    Object.values(COMMITMENTS).filter(c => c[mi] === true).length
  );
const MONTH_UNKNOWN = (monthCount) =>
  Array.from({ length: monthCount }, (_, mi) =>
    Object.values(COMMITMENTS).filter(c => c[mi] === "returning").length
  );

const OPEN_QUESTIONS = [
  { id: "Q1", severity: "high", question: "Josh's split — when does he move to 100% Mobile App?", detail: "Currently 75% Mobile App / 25% PPCX in March. With Matt on leave, Josh likely needs to be 100% Mobile App from April. This is a shared decision with the PPCX team." },
  { id: "Q2", severity: "high", question: "Onboarding Questions or Update Task Instructions — which do we prioritize?", detail: "Josh has capacity for one during the solo window. Both focused on learning how customers use the app and improving the onboarding flow. A decision is needed on which delivers the most insight." },
  { id: "Q3", severity: "high", question: "Yard Status vs. Acquisition — what's the strategic priority?", detail: "Both in June+ but this is a 2-person team. Sequencing needed. This also surfaces a real tension: the app team's capacity doesn't match the company narrative about what the app could be. If the app is a strategic priority, resourcing needs to reflect that." },
];

function getSeverityStyle(s) {
  return { bg: "white", border: "#e2e8f0", badge: "#94a3b8", badgeBg: "#f1f5f9", label: s === "high" ? "Needs decision" : "Monitor" };
}

function getColor(pct) {
  if (pct === 0)    return { fill: "#e2e8f0", bg: "#f8fafc", border: "#e2e8f0", text: "#94a3b8", label: "Open" };
  if (pct <= 0.5)   return { fill: "#86efac", bg: "#f0fdf4", border: "#86efac", text: "#16a34a", label: "Available" };
  if (pct <= 0.79)  return { fill: "#fde047", bg: "#fefce8", border: "#fde047", text: "#854d0e", label: "Some availability" };
  if (pct < 1.0)    return { fill: "#fb923c", bg: "#fff7ed", border: "#fb923c", text: "#c2410c", label: "Limited" };
  return { fill: "#f87171", bg: "#fef2f2", border: "#f87171", text: "#dc2626", label: "At capacity" };
}

const NAME_COL = 80;
const TEAM_ID = "mobile";

export default function MobileAppTeam() {
  const { range, tracks, updateTrack } = useTimeline();
  const MONTHS = range.months ?? ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  const TRACKS = tracks.mobile ?? [];
  const [editingTrack, setEditingTrack] = useState(null);
  const timelineStripRef = useRef(null);
  const rowRefs = useRef([]);
  const rows = buildRowsWithOverrides(TRACKS);
  const { draggingTrackId, handleBarPointerDown } = useTrackDrag(
    timelineStripRef,
    MONTHS.length,
    updateTrack,
    (track, didDrag) => { if (!didDrag) setEditingTrack(track); },
    rowRefs
  );
  const committedByMonth = MONTH_COMMITTED(MONTHS.length);
  const unknownByMonth = MONTH_UNKNOWN(MONTHS.length);

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: "#f8fafc", minHeight: "100vh", padding: "28px 32px", color: "#0f172a", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Capacity Review · Draft</div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>Mobile App Team</h1>
            <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14 }}>{MONTHS[0]} – {MONTHS[MONTHS.length - 1]} {range.year ?? 2026} &nbsp;·&nbsp; 2 engineers &nbsp;·&nbsp; Matt on pat. leave early Apr – mid May</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {PEOPLE.map(p => (
              <div key={p.name} style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "6px 16px", fontSize: 12, fontWeight: 700, color: "#334155", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
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
                {MONTHS.map((_, i) => (
                  <div key={i} style={{ position: "absolute", left: `${(i / MONTHS.length) * 100}%`, top: 0, bottom: 0, borderLeft: i === 0 ? "none" : "1px dashed #e2e8f0", pointerEvents: "none" }} />
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
            Team Capacity · Engineers with assigned work
          </div>

          {PEOPLE.map(person => (
            <div key={person.name} style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
              <div style={{ width: NAME_COL, flexShrink: 0, paddingLeft: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>{person.name}</span>
                <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, marginLeft: 5 }}>{person.role}</span>
              </div>
              <div style={{ flex: 1, display: "flex", gap: 4 }}>
                {MONTHS.map((_, mi) => {
                  const state = COMMITMENTS[person.name][mi];
                  return (
                    <div key={mi} style={{
                      flex: 1, height: 28, borderRadius: 6,
                      background: state === "leave" ? "#fef2f2" : state === "returning" ? `repeating-linear-gradient(45deg, #e2e8f0, #e2e8f0 3px, #f8fafc 3px, #f8fafc 6px)` : state === true ? "#1e293b" : "#f1f5f9",
                      border: state === "leave" ? "1.5px solid #fca5a5" : state === "returning" ? "1.5px dashed #cbd5e1" : "1.5px solid transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: state === "leave" ? 8 : 11, fontWeight: 800,
                      color: state === "leave" ? "#dc2626" : state === true ? "white" : "#94a3b8",
                    }}>
                      {state === true ? "●" : state === "leave" ? "Pat. Leave" : state === "returning" ? "?" : ""}
                    </div>
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
                const effective = EFFECTIVE_CAPACITY[mi];
                const unknown = unknownByMonth[mi];
                const pct = effective === 0 ? 0 : committed / effective;
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
                        <span style={{ fontSize: 10, fontWeight: 700, color: c.text, opacity: 0.6 }}>/ {effective}</span>
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

      {editingTrack && (
        <TrackEditModal
          track={editingTrack}
          monthCount={MONTHS.length}
          onSave={(updates) => updateTrack("mobile", editingTrack.id, updates)}
          onClose={() => setEditingTrack(null)}
        />
      )}

      {/* Open Questions */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#94a3b8", textTransform: "uppercase", marginBottom: 12 }}>Open Questions & Risks</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {OPEN_QUESTIONS.map(q => {
            const s = getSeverityStyle(q.severity);
            return (
              <div key={q.id} style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 12, padding: "13px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ background: s.badgeBg, color: s.badge, fontWeight: 800, fontSize: 10, padding: "3px 8px", borderRadius: 6, flexShrink: 0, letterSpacing: 0.5, border: `1px solid ${s.badge}33`, marginTop: 1 }}>{q.id}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#1e293b", marginBottom: 3 }}>{q.question}</div>
                  <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>{q.detail}</div>
                </div>
                <div style={{ flexShrink: 0, background: s.badgeBg, color: s.badge, fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20, border: `1px solid ${s.badge}33`, marginTop: 1 }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
