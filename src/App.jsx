import { useState } from "react";
import PPCXTeam from "./PPCXTeam";
import MobileAppTeam from "./MobileAppTeam";
import YardAITeam from "./YardAITeam";
import OpenQuestions from "./OpenQuestions";
import { useTimeline } from "./context/TimelineContext";
import { useAuth } from "./context/AuthContext";
import RangeEditModal from "./components/RangeEditModal";
import LoginPage from "./components/LoginPage";

const TABS = [
  { id: "ppcx",      label: "PPCX",           sublabel: "5 engineers" },
  { id: "mobile",    label: "Mobile App",      sublabel: "2 engineers" },
  { id: "yardai",    label: "Yard AI",         sublabel: "4 people" },
  { id: "questions", label: "Open Questions",  sublabelKey: "questions" },
];

export default function App() {
  const [active, setActive] = useState("ppcx");
  const [editingRange, setEditingRange] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { range, questions, updateRange } = useTimeline();
  const { user, isEditor, signOut, isAuthConfigured } = useAuth();
  const questionCount = (questions || []).length;
  const rangeLabel = range.months?.length
    ? `${range.months[0]} – ${range.months[range.months.length - 1]} ${range.year ?? 2026}`
    : "Mar – Aug 2026";

  if (showLogin) {
    return (
      <LoginPage
        onSuccess={() => setShowLogin(false)}
      />
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ background: "white", borderBottom: "2px solid #e2e8f0", padding: "0 40px", display: "flex", alignItems: "center", gap: 32, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ padding: "14px 0", marginRight: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#94a3b8", textTransform: "uppercase" }}>Capacity Review · Draft</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              onClick={() => isEditor && setEditingRange(true)}
              style={{ background: "none", border: "none", padding: 0, marginTop: 2, cursor: isEditor ? "pointer" : "default", display: "flex", alignItems: "center", gap: 6 }}
              title={isEditor ? "Click to edit date range" : undefined}
            >
              <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{rangeLabel}</span>
              {isEditor && <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>Edit</span>}
            </button>
          </div>
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
        {isAuthConfigured && (
          <div style={{ marginLeft: "auto" }}>
            {isEditor ? (
              <button
                type="button"
                onClick={() => signOut()}
                style={{ fontSize: 12, fontWeight: 700, color: "#64748b", background: "none", border: "none", cursor: "pointer" }}
              >
                Log out {user?.email}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowLogin(true)}
                style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", background: "none", border: "none", cursor: "pointer" }}
              >
                Login to edit
              </button>
            )}
          </div>
        )}
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
