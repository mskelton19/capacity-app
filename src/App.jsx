import { useState } from "react";
import PPCXTeam from "./PPCXTeam";
import MobileAppTeam from "./MobileAppTeam";
import YardAITeam from "./YardAITeam";
import OpenQuestions from "./OpenQuestions";
import { useTimeline } from "./context/TimelineContext";
import RangeEditModal from "./components/RangeEditModal";

const TABS = [
  { id: "ppcx",      label: "PPCX",           sublabel: "5 engineers" },
  { id: "mobile",    label: "Mobile App",      sublabel: "2 engineers" },
  { id: "yardai",    label: "Yard AI",         sublabel: "4 people" },
  { id: "questions", label: "Open Questions",  sublabelKey: "questions" },
];

export default function App() {
  const [active, setActive] = useState("ppcx");
  const [editingRange, setEditingRange] = useState(false);
  const { range, questions, updateRange } = useTimeline();
  const questionCount = (questions || []).length;
  const rangeLabel = range.months?.length
    ? `${range.months[0]} – ${range.months[range.months.length - 1]} ${range.year ?? 2026}`
    : "Mar – Aug 2026";

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ background: "white", borderBottom: "2px solid #e2e8f0", padding: "0 40px", display: "flex", alignItems: "center", gap: 32, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ padding: "14px 0", marginRight: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#94a3b8", textTransform: "uppercase" }}>Capacity Review · Draft</div>
          <button
            type="button"
            onClick={() => setEditingRange(true)}
            style={{ background: "none", border: "none", padding: 0, marginTop: 2, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            title="Click to edit date range"
          >
            <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{rangeLabel}</span>
            <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>Edit</span>
          </button>
        </div>
        {TABS.map(tab => {
          const isQuestions = tab.id === "questions";
          const sublabel = tab.sublabelKey === "questions" ? `${questionCount} open items` : tab.sublabel;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "16px 4px", borderBottom: active === tab.id ? `3px solid ${isQuestions ? "#f59e0b" : "#6366f1"}` : "3px solid transparent", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2, transition: "border-color 0.15s" }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: active === tab.id ? (isQuestions ? "#f59e0b" : "#6366f1") : "#334155" }}>{tab.label}</span>
              <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{sublabel}</span>
            </button>
          );
        })}
      </div>

      <div>
        {active === "ppcx"      && <PPCXTeam />}
        {active === "mobile"    && <MobileAppTeam />}
        {active === "yardai"    && <YardAITeam />}
        {active === "questions" && <OpenQuestions />}
      </div>

      {editingRange && (
        <RangeEditModal
          range={range}
          onSave={(months, year) => updateRange(months, year)}
          onClose={() => setEditingRange(false)}
        />
      )}
    </div>
  );
}
