import { useState } from "react";

const CATEGORIES = [
  { id: "all",       label: "All" },
  { id: "strategic", label: "Strategic" },
  { id: "technical", label: "Technical" },
  { id: "resourcing",label: "Resourcing" },
];

const QUESTIONS = [
  {
    id: "S1", category: "strategic", team: "Mobile App",
    question: "Yard Status vs. Acquisition — what's the strategic priority?",
    detail: "Both are planned for June+ but this is a 2-person team. A sequencing decision is needed. This also surfaces a real tension: the app team's capacity doesn't match the company narrative about what the app could be. If the app is a strategic priority, resourcing needs to reflect that.",
  },
  {
    id: "S2", category: "strategic", team: "Mobile App",
    question: "Which track does Josh focus on in April with his 25% PPCX / 75% Mobile App split?",
    detail: "Josh will have ~25% capacity available for a PPCX-side track in April. The three options are: Onboarding Question Optimization, Task Instructions v2, or pulling Yard Status forward slightly. The choice depends on whether the app needs stability work first or if we're ready to focus on customer learning.",
  },
  {
    id: "S3", category: "strategic", team: "PPCX",
    question: "Sunny Guided Season Recap — which team supplies what resources?",
    detail: "Both PPCX and Yard AI are expected to contribute but the resource split is undefined. How much of each team's capacity gets allocated, and who leads, needs to be decided before this can be properly planned.",
  },
  {
    id: "T1", category: "technical", team: "PPCX",
    question: "Tech debt prioritization — what gets worked and in what order?",
    detail: "Brian W is the primary owner of tech debt for potentially 6 months. Having an entire BE engineer dedicated to this is significant. What gets prioritized and why needs a decision so this time is used intentionally.",
  },
  {
    id: "T2", category: "technical", team: "PPCX",
    question: "Yard Status iteration & reminders — what does the next phase look like?",
    detail: "First iteration wraps in March. More work is needed, particularly around reminders. Scope and approach for the next iteration hasn't been defined yet.",
  },
  {
    id: "T3", category: "technical", team: "PPCX",
    question: "What BE work is needed before Sunny Guided Season Recap can start?",
    detail: "Justin is expected to shift to Sunny Guided Season Recap but the BE prerequisites aren't defined. Needs scoping before capacity can be confirmed.",
  },
  {
    id: "R1", category: "resourcing", team: "Both",
    question: "Which track gets Josh's 25% PPCX time in April?",
    detail: "Agreed: Josh will be 75% Mobile App / 25% PPCX in April. The split is resolved — the open question is what that 25% gets used for. Options are Onboarding Question Optimization, Task Instructions v2, or pulling Yard Status forward. Tracked in S2.",
  },
  {
    id: "R2", category: "resourcing", team: "PPCX",
    question: "How many PPCX engineers are needed for Sunny Guided Season Recap, and when?",
    detail: "Justin, Cory, and Bryan D are all question marks in June/July pending this answer. The number of engineers pulled onto this work directly affects how much capacity PPCX has for anything else in Q3.",
  },
];

const TEAM_LABEL = {
  "PPCX":       "PPCX",
  "Mobile App": "Mobile App",
  "Both":       "Both teams",
};

export default function OpenQuestions() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const filtered = activeCategory === "all" ? QUESTIONS : QUESTIONS.filter(q => q.category === activeCategory);
  const counts = Object.fromEntries(CATEGORIES.map(c => [c.id, c.id === "all" ? QUESTIONS.length : QUESTIONS.filter(q => q.category === c.id).length]));

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: "#f8fafc", minHeight: "100vh", padding: "28px 32px", color: "#0f172a", maxWidth: 1200, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Capacity Review · Draft</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>Open Questions</h1>
        <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14 }}>{QUESTIONS.length} items across all teams — click any question to expand</p>
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
              background: isActive ? "#0f172a" : "white",
              color: isActive ? "white" : "#475569",
              border: `1.5px solid ${isActive ? "#0f172a" : "#e2e8f0"}`,
              borderRadius: 8, padding: "7px 14px", cursor: "pointer",
              fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 7,
              transition: "all 0.15s",
            }}>
              {cat.label}
              <span style={{
                background: isActive ? "rgba(255,255,255,0.15)" : "#f1f5f9",
                color: isActive ? "white" : "#64748b",
                fontSize: 11, fontWeight: 800, padding: "1px 6px", borderRadius: 8,
              }}>
                {counts[cat.id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Questions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {filtered.map(q => {
          const isExpanded = expanded === q.id;
          return (
            <div key={q.id} style={{
              background: "white", borderRadius: 12,
              border: `1.5px solid ${isExpanded ? "#cbd5e1" : "#e2e8f0"}`,
              overflow: "hidden", transition: "border-color 0.15s",
              boxShadow: isExpanded ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
            }}>
              <div onClick={() => setExpanded(isExpanded ? null : q.id)} style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                {/* ID */}
                <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", background: "#f1f5f9", padding: "2px 7px", borderRadius: 5, flexShrink: 0, letterSpacing: 0.5 }}>{q.id}</div>

                {/* Question */}
                <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{q.question}</div>

                {/* Team */}
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", flexShrink: 0 }}>{TEAM_LABEL[q.team]}</div>

                {/* Category */}
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", flexShrink: 0, textTransform: "capitalize" }}>{q.category}</div>

                {/* Arrow */}
                <div style={{ color: "#cbd5e1", fontSize: 11, transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>▼</div>
              </div>

              {isExpanded && (
                <div style={{ padding: "0 18px 16px", borderTop: "1px solid #f1f5f9" }}>
                  <div style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 14px", marginTop: 10 }}>
                    <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.7 }}>{q.detail}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
