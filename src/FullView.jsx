import React, { useState, useMemo } from "react";
import { useTimeline } from "./context/TimelineContext";
import { buildRowsWithOverrides } from "./utils/timelineRows";
import { useIsMobile } from "./hooks/useMediaQuery";

const TEAMS = [
  { id: "ppcx", label: "PPCX", accent: "#6366f1", capacityPeople: ["Josh", "Justin", "Bryan D", "Brian W", "Cory"] },
  { id: "mobile", label: "Mobile App", accent: "#f97316", capacityPeople: ["Josh", "Matt"] },
  { id: "yardai", label: "Yard AI", accent: "#06b6d4", capacityPeople: ["Sergio", "James", "Adam", "Maggie"] },
];

/** Match team-page capacity colors: Open, Available, Some availability, Limited, At capacity */
function capacityCellColor(pct) {
  if (pct === 0) return { bg: "#f8fafc", text: "#94a3b8" };
  if (pct <= 0.5) return { bg: "#f0fdf4", text: "#16a34a" };
  if (pct <= 0.79) return { bg: "#fefce8", text: "#854d0e" };
  if (pct < 1) return { bg: "#fff7ed", text: "#c2410c" };
  return { bg: "#fef2f2", text: "#dc2626" };
}

function computeCapacity(commitments, people, monthCount) {
  const committed = [];
  const effective = [];
  for (let mi = 0; mi < monthCount; mi++) {
    let c = 0, onLeave = 0;
    people.forEach((p) => {
      const arr = commitments[p];
      const v = Array.isArray(arr) ? arr[mi] : undefined;
      if (v === true) c++;
      else if (v === "returning") c += 0.5;
      else if (v === "leave") onLeave++;
    });
    committed.push(c);
    effective.push(people.length - onLeave);
  }
  return { committed, effective };
}

const labelPaddingPx = 24;

export default function FullView() {
  const isMobile = useIsMobile();
  const { range, tracks, commitments } = useTimeline();
  const [visibleTeams, setVisibleTeams] = useState(() => TEAMS.map((t) => t.id));

  const MONTHS = range.months ?? ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  const monthCount = MONTHS.length;
  const dateRangeLabel = range.months?.length
    ? `${range.months[0]} – ${range.months[range.months.length - 1]} ${range.year ?? 2026}`
    : "Mar – Aug 2026";

  const teamsToShow = useMemo(() => TEAMS.filter((t) => visibleTeams.includes(t.id)), [visibleTeams]);

  // Mobile-responsive layout
  const teamColWidth = isMobile ? 56 : 100;
  const pxPerMonth = isMobile ? 52 : 100;
  const gridMinWidth = teamColWidth + pxPerMonth * monthCount;
  const barHeight = isMobile ? 22 : 28;
  const sectionPadding = isMobile ? "0 12px 12px" : "0 16px 16px";
  const cardBorderRadius = isMobile ? 0 : 12;
  const cardMargin = isMobile ? { marginLeft: -12, marginRight: -12, width: "calc(100% + 24px)" } : {};

  const toggleTeam = (id) => {
    setVisibleTeams((prev) =>
      prev.includes(id) ? (prev.length === 1 ? prev : prev.filter((x) => x !== id)) : [...prev, id]
    );
  };

  const headerFontSize = isMobile ? 9 : 10;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", padding: isMobile ? 12 : 24, maxWidth: 1200, margin: "0 auto", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ marginBottom: isMobile ? 12 : 20 }}>
        <p style={{ fontSize: isMobile ? 12 : 13, color: "#64748b", margin: 0 }}>{dateRangeLabel}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? 6 : 8, marginTop: isMobile ? 8 : 12, alignItems: "center" }}>
          {TEAMS.map((t) => {
            const on = visibleTeams.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTeam(t.id)}
                style={{
                  padding: isMobile ? "5px 10px" : "6px 12px",
                  borderRadius: 8,
                  border: on ? `2px solid ${t.accent}` : "1px solid #e2e8f0",
                  background: on ? `${t.accent}12` : "white",
                  color: on ? t.accent : "#64748b",
                  fontSize: isMobile ? 11 : 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Roadmap + Capacity: one grid so month columns align */}
      <section style={{ background: "white", borderRadius: cardBorderRadius, boxShadow: isMobile ? "none" : "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden", ...cardMargin }}>
        <div style={{ padding: isMobile ? "10px 12px" : "12px 16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
          <div style={{ fontSize: headerFontSize, fontWeight: 800, letterSpacing: 1, color: "#94a3b8", textTransform: "uppercase" }}>Roadmap &amp; Capacity</div>
        </div>
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div
            style={{
              minWidth: gridMinWidth,
              width: "100%",
              display: "grid",
              gridTemplateColumns: `${teamColWidth}px repeat(${monthCount}, 1fr)`,
              padding: sectionPadding,
            }}
          >
            {/* Month header row — empty cell then one per month */}
            <div style={{ borderRight: "1px solid #e2e8f0", borderBottom: "2px solid #e2e8f0", background: "#f8fafc" }} />
            {MONTHS.map((m) => (
              <div
                key={m}
                style={{
                  textAlign: "center",
                  padding: isMobile ? "6px 0" : "8px 0",
                  fontSize: isMobile ? 10 : 12,
                  fontWeight: 800,
                  color: "#64748b",
                  borderRight: "1px solid #e2e8f0",
                  borderBottom: "2px solid #e2e8f0",
                  background: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {m}
              </div>
            ))}

            {/* Roadmap: team row groups */}
            {teamsToShow.map((team, teamIndex) => {
              const teamTracks = tracks[team.id] ?? [];
              const rows = buildRowsWithOverrides(teamTracks);
              return (
                <React.Fragment key={team.id}>
                  <div
                    style={{
                      borderLeft: isMobile ? `4px solid ${team.accent}` : `6px solid ${team.accent}`,
                      borderTop: teamIndex === 0 ? "none" : "1px solid #e2e8f0",
                      background: `${team.accent}14`,
                      marginTop: teamIndex === 0 ? 0 : isMobile ? 8 : 12,
                      borderRadius: "0 8px 8px 0",
                      padding: isMobile ? "5px 8px 4px" : "8px 12px 6px",
                      fontSize: isMobile ? 10 : 11,
                      fontWeight: 800,
                      color: team.accent,
                      letterSpacing: 0.5,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {team.label}
                  </div>
                  <div
                    style={{
                      gridColumn: `2 / -1`,
                      borderTop: teamIndex === 0 ? "none" : "1px solid #e2e8f0",
                      background: `${team.accent}14`,
                      marginTop: teamIndex === 0 ? 0 : isMobile ? 8 : 12,
                      borderRadius: "0 8px 0 0",
                    }}
                  />
                  {rows.map((row, ri) => {
                    const hasLabelBelow = row.some((t) => {
                      const widthPct = ((t.end - t.start) / monthCount) * 100;
                      const barPx = (widthPct / 100) * pxPerMonth * monthCount;
                      return barPx < (t.label?.length ?? 0) * (isMobile ? 5 : 6) + labelPaddingPx;
                    });
                    return (
                      <React.Fragment key={`${team.id}-${ri}`}>
                        <div style={{ background: "transparent", marginTop: ri === 0 ? (isMobile ? 6 : 8) : 0 }} />
                        <div
                          style={{
                            gridColumn: "2 / -1",
                            position: "relative",
                            height: barHeight,
                            marginTop: ri === 0 ? (isMobile ? 6 : 8) : 0,
                            marginBottom: hasLabelBelow ? (isMobile ? 16 : 20) : 4,
                          }}
                        >
                          {MONTHS.map((_, i) => (
                            <div
                              key={i}
                              style={{
                                position: "absolute",
                                left: `${(i / monthCount) * 100}%`,
                                top: 0,
                                bottom: 0,
                                width: `${100 / monthCount}%`,
                                borderLeft: i === 0 ? "none" : "1px dashed #e2e8f0",
                                pointerEvents: "none",
                                zIndex: 0,
                              }}
                            />
                          ))}
                          {row.map((track) => {
                            const left = (track.start / monthCount) * 100;
                            const width = ((track.end - track.start) / monthCount) * 100;
                            const barPx = (width / 100) * pxPerMonth * monthCount;
                            const labelFits = barPx >= (track.label?.length ?? 0) * (isMobile ? 5 : 6) + labelPaddingPx;
                            return (
                              <React.Fragment key={track.id ?? track.label}>
                                <div
                                  style={{
                                    position: "absolute",
                                    left: `${left}%`,
                                    width: `${width}%`,
                                    top: 1,
                                    bottom: 1,
                                    background: track.atRisk ? "transparent" : track.color,
                                    border: track.atRisk ? `2px dashed ${track.color}` : "none",
                                    borderRadius: isMobile ? "3px 8px 8px 3px" : "4px 10px 10px 4px",
                                    display: "flex",
                                    alignItems: "center",
                                    paddingLeft: isMobile ? 5 : 8,
                                    paddingRight: isMobile ? 8 : 12,
                                    fontSize: isMobile ? 9 : 11,
                                    fontWeight: 700,
                                    color: track.atRisk ? track.color : "white",
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                    boxSizing: "border-box",
                                    zIndex: 1,
                                  }}
                                >
                                  {labelFits ? track.label : ""}
                                </div>
                                {!labelFits && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: barHeight + 2,
                                      left: `${left}%`,
                                      fontSize: isMobile ? 8 : 9,
                                      fontWeight: 700,
                                      color: track.color,
                                      whiteSpace: "nowrap",
                                      background: "white",
                                      padding: isMobile ? "1px 4px" : "2px 6px",
                                      borderRadius: 4,
                                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                      zIndex: 10,
                                      border: `1px solid ${track.color}44`,
                                    }}
                                  >
                                    {track.label}
                                  </div>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </React.Fragment>
                    );
                  })}

                  {/* Capacity strip — after bars to avoid color clash with team header */}
                  {(() => {
                    const teamCommitments = commitments[team.id] ?? {};
                    const { committed: committedByMonth, effective: effectiveByMonth } = computeCapacity(teamCommitments, team.capacityPeople, monthCount);
                    return (
                      <>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: isMobile ? 8 : 9,
                            fontWeight: 700,
                            color: "#94a3b8",
                            letterSpacing: 0.5,
                            textTransform: "uppercase",
                            padding: isMobile ? "3px 0" : "4px 0",
                            borderTop: "1px solid #e2e8f0",
                            marginBottom: isMobile ? 6 : 8,
                          }}
                        >
                          Cap
                        </div>
                        {MONTHS.map((m, mi) => {
                          const committed = committedByMonth[mi] ?? 0;
                          const eff = effectiveByMonth[mi] ?? team.capacityPeople.length;
                          const pct = eff > 0 ? committed / eff : 0;
                          const c = capacityCellColor(pct);
                          return (
                            <div
                              key={m}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: isMobile ? 9 : 10,
                                fontWeight: 600,
                                background: c.bg,
                                color: c.text,
                                borderRight: "1px solid #e2e8f0",
                                borderTop: "1px solid #e2e8f0",
                                marginBottom: isMobile ? 6 : 8,
                                padding: isMobile ? "3px 0" : "4px 0",
                              }}
                            >
                              {committed}/{eff}
                            </div>
                          );
                        })}
                      </>
                    );
                  })()}
                </React.Fragment>
              );
            })}

          </div>
        </div>
      </section>
    </div>
  );
}
