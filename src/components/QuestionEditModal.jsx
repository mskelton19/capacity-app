import { useState, useEffect } from "react";
import { QUESTION_STATUSES, QUESTION_CATEGORIES } from "../context/TimelineContext";

const TEAM_OPTIONS = [
  { id: "ppcx", label: "PPCX" },
  { id: "mobile", label: "Mobile App" },
  { id: "yardai", label: "Yard AI" },
];

export default function QuestionEditModal({ question, onSave, onClose }) {
  const isNew = !question?.id;
  const [questionText, setQuestionText] = useState("");
  const [detail, setDetail] = useState("");
  const [teams, setTeams] = useState([]);
  const [status, setStatus] = useState("Needs discussion");
  const [category, setCategory] = useState("strategic");

  useEffect(() => {
    if (!question) {
      setQuestionText("");
      setDetail("");
      setTeams(["ppcx"]);
      setStatus("Needs discussion");
      setCategory("strategic");
      return;
    }
    setQuestionText(question.question ?? "");
    setDetail(question.detail ?? "");
    setTeams(Array.isArray(question.teams) ? [...question.teams] : []);
    setStatus(question.status ?? "Needs discussion");
    setCategory(question.category ?? "strategic");
  }, [question]);

  const toggleTeam = (id) => {
    setTeams((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      question: questionText.trim(),
      detail: detail.trim(),
      teams: teams.length ? teams : ["ppcx"],
      status,
      category,
    };
    if (isNew) payload.id = undefined;
    onSave(payload);
    onClose();
  };

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
          maxWidth: 480,
          width: "90%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
          {isNew ? "Add question" : "Edit question"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Question</label>
            <input
              type="text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              required
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }}
              placeholder="Short question title"
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Detail / context</label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={4}
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", resize: "vertical" }}
              placeholder="Background and why this matters"
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Teams</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TEAM_OPTIONS.map((t) => (
                <label key={t.id} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: "#475569" }}>
                  <input type="checkbox" checked={teams.includes(t.id)} onChange={() => toggleTeam(t.id)} />
                  {t.label}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }}>
                {QUESTION_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }}>
                {QUESTION_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 18px", border: "1.5px solid #e2e8f0", background: "white", borderRadius: 8, fontSize: 13, fontWeight: 700, color: "#64748b", cursor: "pointer" }}>Cancel</button>
            <button type="submit" style={{ padding: "10px 18px", border: "none", background: "#6366f1", borderRadius: 8, fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer" }}>{isNew ? "Add" : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
