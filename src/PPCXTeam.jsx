import { useState, useRef } from "react";
import { useTimeline } from "./context/TimelineContext";
import { useAuth } from "./context/AuthContext";
import TrackEditModal from "./components/TrackEditModal";
import { useTrackDrag } from "./hooks/useTrackDrag";
import { buildRowsWithOverrides } from "./utils/timelineRows";
import { useIsMobile } from "./hooks/useMediaQuery";

const PEOPLE = [
  { name: "Chelsea", role: "PM", countsForCapacity: false },
  { name: "Francesco", role: "Design", countsForCapacity: false },
  { name: "Josh", role: "FE" },
  { name: "Justin", role: "FE" },
  { name: "Bryan D", role: "BE" },
  { name: "Brian W", role: "BE" },
  { name: "Cory", role: "BE" },
];
const CAPACITY_PEOPLE = PEOPLE.filter((p) => p.countsForCapacity !== false);
const TEAM_SIZE = CAPACITY_PEOPLE.length;

const PHASE_LABELS = [
  { start: 0, end: 1, label: "All hands on deck", sublabel: "5 of 5 engineers committed", bg: "#fef2f2", border: "#fca5a5", text: "#dc2626" },
  { start: 1, end: 3.0, label: "Sub Management push", sublabel: "Core PPCX focus", bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
  { start: 3.0, end: 5.0, label: "Capacity opens up", sublabel: "Cory + Bryan D unassigned", bg: "#f0fdf4", border: "#86efac", text: "#16a34a" },
  { start: 5.0, end: 6, label: "TBD", sublabel: "Planning needed", bg: "#f5f3ff", border: "#c4b5fd", text: "#7c3aed" },
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

import QuestionEditModal from "./components/QuestionEditModal";
import { getQuestionStatusStyle } from "./utils/questionStatus";

const TEAM_ID = "ppcx";

function getColor(pct) {
  if (pct === 0)    return { fill: "#e2e8f0", bg: "#f8fafc", border: "#e2e8f0", text: "#94a3b8", label: "Open" };
  if (pct <= 0.5)   return { fill: "#86efac", bg: "#f0fdf4", border: "#86efac", text: "#16a34a", label: "Available" };
  if (pct <= 0.79)  return { fill: "#fde047", bg: "#fefce8", border: "#fde047", text: "#854d0e", label: "Some availability" };
  if (pct < 1.0)    return { fill: "#fb923c", bg: "#fff7ed", border: "#fb923c", text: "#c2410c", label: "Limited" };
  return { fill: "#f87171", bg: "#fef2f2", border: "#f87171", text: "#dc2626", label: "At capacity" };
}

const NAME_COL = 80;

export default function PPCXTeam() {
  const isMobile = useIsMobile();
  const { isEditor } = useAuth();
  const { range, tracks, commitments, questions, updateTrack, addTrack, removeTrack, updateCommitment, addQuestion, updateQuestion, removeQuestion } = useTimeline();
  const MONTHS = range.months ?? ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  const monthCount = MONTHS.length;
  const TRACKS = tracks.ppcx ?? [];
  const teamCommitments = commitments.ppcx ?? {};
  const { committed: committedByMonth, unknown: unknownByMonth } = computeCommittedUnknown(teamCommitments, CAPACITY_PEOPLE, monthCount);
  const [editingTrack, setEditingTrack] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const timelineStripRef = useRef(null);
  const teamQuestions = (questions || []).filter((q) => (q.teams || []).includes("ppcx"));
  const rowRefs = useRef([]);
  const rows = buildRowsWithOverrides(TRACKS);
  const { draggingTrackId, handleBarPointerDown, handleResizeLeftPointerDown, handleResizeRightPointerDown } = useTrackDrag(
    timelineStripRef,
    monthCount,
    updateTrack,
    (track, didDrag) => { if (isEditor && !didDrag) setEditingTrack(track); },
    rowRefs
  );

  const nameCol = isMobile ? 36 : NAME_COL;
  const timelineLeftCol = isMobile ? nameCol : 0;
  const pagePadding = isMobile ? "16px" : "28px 32px";
  const timelineMinWidth = isMobile ? 320 : undefined;
  const barHeight = isMobile ? 26 : 36;
  const phaseHeight = isMobile ? 26 : 40;
  const monthPad = isMobile ? "6px 0" : "10px 0";
  const monthFont = isMobile ? 11 : 13;
  const ganttPad = isMobile ? "10px 0 8px" : "16px 0 14px";
  const rowGap = isMobile ? 12 : 22;

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: "#f8fafc", minHeight: "100vh", padding: pagePadding, color: "#0f172a", maxWidth: 1200, margin: "0 auto", boxSizing: "border-box" }}>
      {!isMobile && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Capacity Review · Draft</div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>PPCX Team</h1>
              <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14 }}>{MONTHS[0]} – {MONTHS[MONTHS.length - 1]} {range.year ?? 2026} · 7 people · 1 PM, 1 Design, 2 FE, 3 BE</p>
            </div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, flexShrink: 0 }}>
              {PEOPLE.map(p => (
                <div key={p.name} style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 700, color: "#334155", display: "flex", flexDirection: "column", alignItems: "center", gap: 1, flexShrink: 0 }}>
                  <span>{p.name}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>{p.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", marginBottom: 20, ...(isMobile && { marginLeft: -16, marginRight: -16, width: "calc(100% + 32px)" }) }}>
        <div style={{ background: "white", borderRadius: isMobile ? 0 : 16, boxShadow: isMobile ? "none" : "0 2px 12px rgba(0,0,0,0.07)", overflow: "hidden", minWidth: timelineMinWidth }}>
        {/* Month headers */}
        <div style={{ display: "flex", borderBottom: "2px solid #e2e8f0", background: "#f8fafc" }}>
          <div style={{ width: timelineLeftCol, flexShrink: 0 }} />
          <div style={{ flex: 1, display: "flex" }}>
            {MONTHS.map(m => (
              <div key={m} style={{ flex: 1, textAlign: "center", padding: monthPad, fontSize: monthFont, fontWeight: 800, color: "#64748b" }}>{m}</div>
            ))}
          </div>
        </div>

        {/* Phase banners */}
        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ width: timelineLeftCol, flexShrink: 0 }} />
          <div style={{ flex: 1, position: "relative", height: phaseHeight }}>
            {PHASE_LABELS.map((phase, i) => {
              const left = (phase.start / MONTHS.length) * 100;
              const width = ((phase.end - phase.start) / MONTHS.length) * 100;
              return (
                <div key={i} style={{ position: "absolute", left: `${left}%`, width: `${width}%`, top: 0, bottom: 0, background: phase.bg, borderRight: i < PHASE_LABELS.length - 1 ? `2px solid ${phase.border}` : "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: isMobile ? 9 : 10, fontWeight: 800, color: phase.text, whiteSpace: "nowrap" }}>{phase.label}</div>
                  <div style={{ fontSize: isMobile ? 8 : 9, color: phase.text, opacity: 0.75, whiteSpace: "nowrap" }}>{phase.sublabel}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gantt */}
        <div style={{ padding: ganttPad, borderBottom: "2px solid #e2e8f0" }}>
          {rows.map((row, ri) => (
            <div key={ri} ref={(el) => { rowRefs.current[ri] = el; }} style={{ display: "flex", marginBottom: ri < rows.length - 1 ? rowGap : (isMobile ? 6 : 8) }}>
              <div style={{ width: timelineLeftCol, flexShrink: 0 }} />
              <div ref={ri === 0 ? timelineStripRef : null} style={{ flex: 1, position: "relative", height: barHeight }}>
                {MONTHS.map((_, i) => (
                  <div key={i} style={{ position: "absolute", left: `${(i / MONTHS.length) * 100}%`, top: 0, bottom: 0, borderLeft: i === 0 ? "none" : "1px dashed #e2e8f0", pointerEvents: "none", zIndex: 0 }} />
                ))}
                {row.map(track => {
                  const left = (track.start / MONTHS.length) * 100;
                  const width = ((track.end - track.start) / MONTHS.length) * 100;
                  const barPx = (width / 100) * (isMobile ? 280 : 1100);
                  const labelPx = track.label.length * (isMobile ? 5 : 6.5) + (isMobile ? 16 : 30);
                  const labelFits = barPx > labelPx;
                  const isDragging = draggingTrackId === track.id;
                  return (
                    <div key={track.id ?? track.label} style={{ position: "absolute", left: `${left}%`, width: `${width}%`, height: barHeight, zIndex: 2 }}>
                      {track.atRisk && <div style={{ position: "absolute", inset: 0, background: "#f8fafc", borderRadius: isMobile ? "3px 10px 10px 3px" : "4px 14px 14px 4px" }} aria-hidden />}
                      {isEditor && (
                        <>
                          <div
                            onMouseDown={(e) => handleResizeLeftPointerDown(track, TEAM_ID, e)}
                            onTouchStart={(e) => handleResizeLeftPointerDown(track, TEAM_ID, e)}
                            style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 10, cursor: "ew-resize", zIndex: 3 }}
                            title="Drag to resize"
                          />
                          <div
                            onMouseDown={(e) => handleResizeRightPointerDown(track, TEAM_ID, e)}
                            onTouchStart={(e) => handleResizeRightPointerDown(track, TEAM_ID, e)}
                            style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 10, cursor: "ew-resize", zIndex: 3 }}
                            title="Drag to resize"
                          />
                        </>
                      )}
                      <div
                        onMouseDown={(e) => { if (isEditor) { e.preventDefault(); handleBarPointerDown(track, TEAM_ID, e, ri); } }}
                        onTouchStart={(e) => { if (isEditor) handleBarPointerDown(track, TEAM_ID, e, ri); }}
                        style={{ position: "relative", height: "100%", background: track.atRisk ? "transparent" : track.color, border: track.atRisk ? `2px dashed ${track.color}` : "none", borderRadius: isMobile ? "3px 10px 10px 3px" : "4px 14px 14px 4px", display: "flex", alignItems: "center", paddingLeft: isMobile ? 6 : 12, paddingRight: isMobile ? 10 : 20, fontSize: isMobile ? 10 : 12, fontWeight: 700, color: track.atRisk ? track.color : "white", whiteSpace: "nowrap", overflow: "hidden", clipPath: track.atRisk ? "none" : "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)", boxShadow: track.atRisk ? "none" : "0 1px 3px rgba(0,0,0,0.12)", cursor: isEditor ? (isDragging ? "grabbing" : "grab") : "default", userSelect: "none", opacity: isDragging ? 0.9 : 1 }}
                        title={isEditor ? "Drag to move, click to edit" : undefined}
                      >
                        {labelFits ? track.label : ""}
                      </div>
                      {!labelFits && (
                        <div style={{ position: "absolute", top: barHeight + 2, left: 0, fontSize: 9, fontWeight: 700, color: track.color, whiteSpace: "nowrap", background: "white", padding: "1px 4px", borderRadius: 4, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", zIndex: 10, border: `1px solid ${track.color}44` }}>
                          {track.label}
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
        <div style={{ padding: isMobile ? "12px 12px 12px 0" : "12px 16px 12px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isMobile ? 8 : 8, paddingLeft: timelineLeftCol, gap: 12 }}>
            <div style={{ fontSize: isMobile ? 10 : 11, fontWeight: 800, letterSpacing: 1.5, color: "#94a3b8", textTransform: "uppercase" }}>
              Team Capacity · Engineers with assigned work
            </div>
            {isEditor && (
              <button
                type="button"
                onClick={() => setEditingTrack({ isNew: true })}
                style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: "#6366f1", background: "none", border: "none", cursor: "pointer" }}
              >
                + Add project
              </button>
            )}
          </div>

          {CAPACITY_PEOPLE.map(person => (
            <div key={person.name} style={{ marginBottom: isMobile ? 4 : 3 }}>
              {isMobile ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ width: nameCol, flexShrink: 0, paddingLeft: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#334155" }}>{person.name}</span>
                    <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, marginLeft: 5 }}>{person.role}</span>
                  </div>
                  <div style={{ flex: 1, display: "flex", gap: 2 }}>
                    {MONTHS.map((_, mi) => {
                      const arr = teamCommitments[person.name];
                      const state = Array.isArray(arr) ? arr[mi] : (mi === 0 ? true : false);
                      return (
                        <button
                          key={mi}
                          type="button"
                          disabled={!isEditor}
                          onClick={() => isEditor && updateCommitment("ppcx", person.name, mi, nextCommitmentValue(state))}
                          style={{ flex: 1, height: 22, borderRadius: 4, background: state === true ? "#1e293b" : state === null ? `repeating-linear-gradient(45deg, #e2e8f0, #e2e8f0 3px, #f8fafc 3px, #f8fafc 6px)` : "#f1f5f9", border: state === null ? "1.5px dashed #cbd5e1" : "1.5px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: state === true ? "white" : "#94a3b8", cursor: isEditor ? "pointer" : "default" }}
                          title={isEditor ? "Click to cycle: available → committed → unknown" : undefined}
                        >
                          {state === true ? "●" : state === null ? "?" : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 80, flexShrink: 0, fontSize: 11, fontWeight: 700, color: "#334155" }}>
                    <span>{person.name}</span>
                    <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, marginLeft: 6 }}>{person.role}</span>
                  </div>
                  <div style={{ flex: 1, display: "flex", gap: 3 }}>
                    {MONTHS.map((_, mi) => {
                      const arr = teamCommitments[person.name];
                      const state = Array.isArray(arr) ? arr[mi] : (mi === 0 ? true : false);
                      return (
                        <button
                          key={mi}
                          type="button"
                          disabled={!isEditor}
                          onClick={() => isEditor && updateCommitment("ppcx", person.name, mi, nextCommitmentValue(state))}
                          style={{ flex: 1, height: 22, borderRadius: 5, background: state === true ? "#1e293b" : state === null ? `repeating-linear-gradient(45deg, #e2e8f0, #e2e8f0 3px, #f8fafc 3px, #f8fafc 6px)` : "#f1f5f9", border: state === null ? "1.5px dashed #cbd5e1" : "1.5px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: state === true ? "white" : "#94a3b8", cursor: isEditor ? "pointer" : "default" }}
                          title={isEditor ? "Click to cycle: available → committed → unknown" : undefined}
                        >
                          {state === true ? "●" : state === null ? "?" : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}

          <div style={{ borderTop: "1px solid #e2e8f0", margin: isMobile ? "10px 0" : "8px 0" }} />

          {/* Summary */}
          {isMobile ? (
            <div style={{ display: "flex", alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ width: nameCol, flexShrink: 0, paddingLeft: 6, fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: "#94a3b8", textTransform: "uppercase", paddingTop: 12 }}>Summary</div>
              <div style={{ flex: 1, display: "flex", gap: 2 }}>
                {MONTHS.map((_, mi) => {
                  const committed = committedByMonth[mi];
                  const unknown = unknownByMonth[mi];
                  const pct = committed / TEAM_SIZE;
                  const c = getColor(pct);
                  return (
                    <div key={mi} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                      <div style={{ height: 4, display: "flex", justifyContent: "center" }} />
                      <div style={{ borderRadius: 6, border: `1.5px solid ${c.border}`, background: c.bg, padding: "6px 4px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <div style={{ width: "100%", height: 4, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${Math.min(pct * 100, 100)}%`, height: "100%", background: c.fill, borderRadius: 3 }} />
                        </div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                          <span style={{ fontSize: 16, fontWeight: 900, color: c.text, lineHeight: 1 }}>{committed}</span>
                          <span style={{ fontSize: 9, fontWeight: 700, color: c.text, opacity: 0.6 }}>/ {TEAM_SIZE}</span>
                        </div>
                        <div style={{ fontSize: 8, fontWeight: 700, color: c.text, opacity: 0.8, textTransform: "uppercase", letterSpacing: 0.5 }}>{c.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: "#94a3b8", textTransform: "uppercase", marginBottom: 2 }}>Summary</div>
              <div style={{ display: "flex", gap: 4 }}>
                {MONTHS.map((_, mi) => {
                const committed = committedByMonth[mi];
                const unknown = unknownByMonth[mi];
                const pct = committed / TEAM_SIZE;
                const c = getColor(pct);
                return (
                  <div key={mi} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ height: 4, display: "flex", justifyContent: "center" }} />
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
            </>
          )}


        </div>
        </div>
      </div>

      {editingTrack && (
        <TrackEditModal
          track={editingTrack}
          monthCount={MONTHS.length}
          months={MONTHS}
          year={range.year}
          isCreate={editingTrack.isNew}
          onSave={(updates) => {
            if (editingTrack.isNew) {
              addTrack("ppcx", updates);
            } else {
              updateTrack("ppcx", editingTrack.id, updates);
            }
            setEditingTrack(null);
          }}
          onDelete={editingTrack.isNew ? undefined : () => removeTrack("ppcx", editingTrack.id)}
          onClose={() => setEditingTrack(null)}
        />
      )}

      {/* Open Questions */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#94a3b8", textTransform: "uppercase" }}>Open Questions & Risks</div>
          {isEditor && <button type="button" onClick={() => setEditingQuestion({})} style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", background: "none", border: "none", cursor: "pointer" }}>+ Add question</button>}
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
                  {isEditor && <button type="button" onClick={() => setEditingQuestion(q)} style={{ fontSize: 11, fontWeight: 700, color: "#64748b", background: "none", border: "none", cursor: "pointer" }}>Edit</button>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editingQuestion && (
        <QuestionEditModal
          question={editingQuestion.id ? editingQuestion : null}
          onSave={(payload) => (editingQuestion.id ? updateQuestion(editingQuestion.id, payload) : addQuestion({ ...payload, teams: payload.teams || ["ppcx"] }))}
          onDelete={editingQuestion.id ? () => removeQuestion(editingQuestion.id) : undefined}
          onClose={() => setEditingQuestion(null)}
        />
      )}
    </div>
  );
}
