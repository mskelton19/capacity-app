import { useState } from "react";
import PPCXTeam from "./PPCXTeam";
import MobileAppTeam from "./MobileAppTeam";
import YardAITeam from "./YardAITeam";
import OpenQuestions from "./OpenQuestions";
import { useTimeline } from "./context/TimelineContext";
import { useAuth } from "./context/AuthContext";
import RangeEditModal from "./components/RangeEditModal";
import LoginPage from "./components/LoginPage";
import { useIsMobile } from "./hooks/useMediaQuery";

const TABS = [
  { id: "ppcx",      label: "PPCX",           sublabel: "7 people" },
  { id: "mobile",    label: "Mobile App",      sublabel: "4 people" },
  { id: "yardai",    label: "Yard AI",         sublabel: "6 people" },
  { id: "questions", label: "Open Questions",  sublabelKey: "questions" },
];

export default function App() {
  const [active, setActive] = useState("ppcx");
  const [editingRange, setEditingRange] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const isMobile = useIsMobile();
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

  const headerPadding = isMobile ? "0 16px" : "0 40px";
  const tabPadding = isMobile ? "12px 10px" : "16px 12px";
  const tabFontSize = isMobile ? 12 : 13;
  const tabGap = isMobile ? 0 : 8;

  const authButton = isAuthConfigured && (
    isEditor ? (
      <button
        type="button"
        onClick={() => signOut()}
        style={{ fontSize: isMobile ? 12 : 13, fontWeight: 700, color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: isMobile ? "8px 0" : 0 }}
      >
        {isMobile ? "Log out" : `Log out ${user?.email}`}
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setShowLogin(true)}
        style={{ fontSize: isMobile ? 12 : 13, fontWeight: 700, color: "#6366f1", background: "none", border: "none", cursor: "pointer", padding: isMobile ? "8px 0" : 0 }}
      >
        Login to edit
      </button>
    )
  );

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      <header style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: headerPadding, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        {isMobile ? (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 48, paddingTop: 8, paddingBottom: 4 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: "#94a3b8", textTransform: "uppercase" }}>Capacity Review</div>
                <button
                  type="button"
                  onClick={() => isEditor && setEditingRange(true)}
                  style={{ background: "none", border: "none", padding: 0, marginTop: 2, cursor: isEditor ? "pointer" : "default", display: "flex", alignItems: "center", gap: 4 }}
                  title={isEditor ? "Tap to edit date range" : undefined}
                >
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{rangeLabel}</span>
                  {isEditor && <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>Edit</span>}
                </button>
              </div>
              {authButton}
            </div>
            <div style={{ display: "flex", overflowX: "auto", WebkitOverflowScrolling: "touch", marginLeft: -16, marginRight: -16, paddingLeft: 16, paddingRight: 16, gap: 0 }}>
              {TABS.map(tab => {
                const isQuestions = tab.id === "questions";
                const sublabel = tab.sublabelKey === "questions" ? `${questionCount} open` : tab.sublabel;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActive(tab.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: tabPadding, flexShrink: 0, borderBottom: active === tab.id ? `3px solid ${isQuestions ? "#f59e0b" : "#6366f1"}` : "3px solid transparent", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1, transition: "border-color 0.15s" }}
                  >
                    <span style={{ fontSize: tabFontSize, fontWeight: 800, color: active === tab.id ? (isQuestions ? "#f59e0b" : "#6366f1") : "#334155" }}>{tab.label}</span>
                    <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{sublabel}</span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
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
            <div style={{ display: "flex", overflowX: "auto", WebkitOverflowScrolling: "touch", gap: tabGap }}>
              {TABS.map(tab => {
                const isQuestions = tab.id === "questions";
                const sublabel = tab.sublabelKey === "questions" ? `${questionCount} open` : tab.sublabel;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActive(tab.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: tabPadding, flexShrink: 0, borderBottom: active === tab.id ? `3px solid ${isQuestions ? "#f59e0b" : "#6366f1"}` : "3px solid transparent", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2, transition: "border-color 0.15s" }}
                  >
                    <span style={{ fontSize: tabFontSize, fontWeight: 800, color: active === tab.id ? (isQuestions ? "#f59e0b" : "#6366f1") : "#334155" }}>{tab.label}</span>
                    <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{sublabel}</span>
                  </button>
                );
              })}
            </div>
            {authButton && <div style={{ marginLeft: "auto" }}>{authButton}</div>}
          </div>
        )}
      </header>

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
