import { useState, useMemo } from "react";
import { useTimeline } from "./context/TimelineContext";
import { useAuth } from "./context/AuthContext";
import QuestionEditModal from "./components/QuestionEditModal";
import { getQuestionStatusStyle } from "./utils/questionStatus";
import { useIsMobile } from "./hooks/useMediaQuery";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "strategic", label: "Strategic" },
  { id: "technical", label: "Technical" },
  { id: "resourcing", label: "Resourcing" },
];

const TEAM_GROUP_LABELS = {
  ppcx: "PPCX",
  mobile: "Mobile App",
  yardai: "Yard AI",
  multiple: "Multiple teams",
};

function groupQuestionsByTeam(questions) {
  const groups = { ppcx: [], mobile: [], yardai: [], multiple: [] };
  (questions || []).forEach((q) => {
    const t = q.teams || [];
    if (t.length > 1) groups.multiple.push(q);
    else if (t[0] === "ppcx") groups.ppcx.push(q);
    else if (t[0] === "mobile") groups.mobile.push(q);
    else if (t[0] === "yardai") groups.yardai.push(q);
  });
  return groups;
}

function getTeamDisplayLabel(teams) {
  if (!teams?.length) return "—";
  if (teams.length > 1) return teams.map((t) => TEAM_GROUP_LABELS[t] || t).join(", ");
  return TEAM_GROUP_LABELS[teams[0]] || teams[0];
}

export default function OpenQuestions() {
  const isMobile = useIsMobile();
  const { isEditor } = useAuth();
  const { questions, addQuestion, updateQuestion, removeQuestion } = useTimeline();
  const [activeCategory, setActiveCategory] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const filteredByCategory = useMemo(() => {
    const list = questions || [];
    return activeCategory === "all" ? list : list.filter((q) => q.category === activeCategory);
  }, [questions, activeCategory]);

  const grouped = useMemo(() => groupQuestionsByTeam(filteredByCategory), [filteredByCategory]);

  const counts = useMemo(() => {
    const list = questions || [];
    return {
      all: list.length,
      strategic: list.filter((q) => q.category === "strategic").length,
      technical: list.filter((q) => q.category === "technical").length,
      resourcing: list.filter((q) => q.category === "resourcing").length,
    };
  }, [questions]);

  const groupOrder = ["ppcx", "mobile", "yardai", "multiple"];

  const pagePadding = isMobile ? "16px" : "28px 32px";

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: "#f8fafc", minHeight: "100vh", padding: pagePadding, color: "#0f172a", maxWidth: 1200, margin: "0 auto", boxSizing: "border-box" }}>
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <div style={{ fontSize: isMobile ? 10 : 11, fontWeight: 800, letterSpacing: 2, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Capacity Review · Draft</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>Open Questions</h1>
            <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: isMobile ? 12 : 14 }}>{(questions || []).length} items across all teams — tap to expand, use category to find where you can help</p>
          </div>
          {isEditor && <button type="button" onClick={() => setEditingQuestion({})} style={{ padding: isMobile ? "6px 12px" : "8px 16px", fontSize: isMobile ? 11 : 12, fontWeight: 700, color: "#6366f1", background: "white", border: "1.5px solid #6366f1", borderRadius: 8, cursor: "pointer", flexShrink: 0 }}>+ Add question</button>}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              background: activeCategory === cat.id ? "#0f172a" : "white",
              color: activeCategory === cat.id ? "white" : "#475569",
              border: `1.5px solid ${activeCategory === cat.id ? "#0f172a" : "#e2e8f0"}`,
              borderRadius: 8,
              padding: isMobile ? "6px 10px" : "7px 14px",
              cursor: "pointer",
              fontSize: isMobile ? 11 : 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            {cat.label}
            <span style={{ background: activeCategory === cat.id ? "rgba(255,255,255,0.15)" : "#f1f5f9", color: activeCategory === cat.id ? "white" : "#64748b", fontSize: 10, fontWeight: 800, padding: "1px 6px", borderRadius: 8 }}>{counts[cat.id]}</span>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 16 : 24 }}>
        {groupOrder.map((groupKey) => {
          const items = grouped[groupKey] || [];
          if (items.length === 0) return null;
          return (
            <div key={groupKey}>
              <div style={{ fontSize: isMobile ? 10 : 11, fontWeight: 800, letterSpacing: 1.5, color: "#64748b", marginBottom: 10, textTransform: "uppercase" }}>{TEAM_GROUP_LABELS[groupKey]}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {items.map((q) => {
                  const isExpanded = expanded === q.id;
                  const statusStyle = getQuestionStatusStyle(q.status);
                  return (
                    <div
                      key={q.id}
                      style={{
                        background: "white",
                        borderRadius: 12,
                        border: `1.5px solid ${isExpanded ? "#cbd5e1" : "#e2e8f0"}`,
                        overflow: "hidden",
                        boxShadow: isExpanded ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
                      }}
                    >
                      <div onClick={() => setExpanded(isExpanded ? null : q.id)} style={{ padding: isMobile ? "12px 14px" : "14px 18px", cursor: "pointer", display: "flex", flexDirection: isMobile ? "column" : "row", flexWrap: "wrap", alignItems: isMobile ? "stretch" : "center", gap: isMobile ? 8 : 12 }}>
                        <div style={{ flex: 1, fontSize: isMobile ? 12 : 13, fontWeight: 700, color: "#1e293b", minWidth: 0 }}>{q.question}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b" }}>{getTeamDisplayLabel(q.teams)}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "capitalize" }}>{q.category}</span>
                          <span style={{ background: statusStyle.bg, color: statusStyle.text, fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20, border: `1px solid ${statusStyle.border}` }}>{q.status}</span>
                          {isEditor && <button type="button" onClick={(e) => { e.stopPropagation(); setEditingQuestion(q); }} style={{ fontSize: 11, fontWeight: 700, color: "#64748b", background: "none", border: "none", cursor: "pointer" }}>Edit</button>}
                          <div style={{ color: "#cbd5e1", fontSize: 11, transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</div>
                        </div>
                      </div>
                      {isExpanded && (
                        <div style={{ padding: isMobile ? "0 14px 14px" : "0 18px 16px", borderTop: "1px solid #f1f5f9" }}>
                          <div style={{ background: "#f8fafc", borderRadius: 8, padding: isMobile ? "10px 12px" : "12px 14px", marginTop: 10 }}>
                            <div style={{ fontSize: isMobile ? 12 : 13, color: "#475569", lineHeight: 1.7 }}>{q.detail}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {editingQuestion && (
        <QuestionEditModal
          question={editingQuestion.id ? editingQuestion : null}
          onSave={(payload) => (editingQuestion.id ? updateQuestion(editingQuestion.id, payload) : addQuestion(payload))}
          onDelete={editingQuestion.id ? () => removeQuestion(editingQuestion.id) : undefined}
          onClose={() => setEditingQuestion(null)}
        />
      )}
    </div>
  );
}
