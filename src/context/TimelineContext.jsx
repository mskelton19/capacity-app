import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { fetchAppState, saveAppState } from "../api/appState";
import { useAuth } from "./AuthContext";

const STORAGE_KEY = "capacity-app-timelines";

const DEFAULT_MONTHS = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];
const DEFAULT_YEAR = 2026;

const DEFAULT_TRACKS = {
  ppcx: [
    { id: "t1", label: "Yard Status UI + YS-Sunny Activation", start: 0, end: 0.55, color: "#6366f1" },
    { id: "t2", label: "Comprehensive Checklist BE", start: 0, end: 0.32, color: "#06b6d4" },
    { id: "t3", label: "Sub Management Core Plan Edit", start: 1.37, end: 3.0, color: "#7c3aed" },
    { id: "t4", label: "Sub Management Unified Pages", start: 0.45, end: 1.80, color: "#0ea5e9" },
    { id: "t5", label: "Sub Management Refactor", start: 0, end: 1.0, color: "#0284c7" },
    { id: "t6", label: "Tech Debt", start: 0, end: 5.0, color: "#94a3b8" },
    { id: "t7", label: "Sunny Guided Season Recap", start: 3.0, end: 5.0, color: "#f59e0b", atRisk: true },
  ],
  mobile: [
    { id: "m1", label: "App Release / Fast Follows", start: 0, end: 2.4, color: "#f97316" },
    { id: "m2", label: "Yard Status", start: 2.4, end: 4.5, color: "#f59e0b", atRisk: true },
    { id: "m3", label: "Onboarding Images", start: 0.15, end: 1.15, color: "#fb923c" },
    { id: "m4", label: "Onboarding Questions", start: 1.15, end: 2.3, color: "#a78bfa", atRisk: true },
    { id: "m5", label: "Skipped Image Uploads", start: 0.4, end: 1.4, color: "#fdba74" },
    { id: "m6", label: "Task Instructions v2", start: 1.4, end: 2.3, color: "#818cf8", atRisk: true },
    { id: "m7", label: "Acquisition", start: 4.5, end: 6.0, color: "#10b981", atRisk: true },
  ],
  yardai: [
    { id: "y1", label: "Yard Status Check-Ins", start: 0, end: 0.48, color: "#38bdf8" },
    { id: "y2", label: "Chat History UI", start: 0, end: 0.48, color: "#0ea5e9" },
    { id: "y3", label: "Sunny Checkout", start: 0.61, end: 1.5, color: "#0284c7" },
    { id: "y4", label: "Sunny Product Recs", start: 0.26, end: 1.0, color: "#0891b2" },
    { id: "y5", label: "Sunny Seasonality", start: 1.0, end: 1.70, color: "#0369a1" },
    { id: "y6", label: "CS Handoff", start: 1.80, end: 2.77, color: "#0c4a6e" },
    { id: "y7", label: "Weather in Sunny", start: 0.26, end: 1.0, color: "#0e7490" },
    { id: "y8", label: "Weather - Specialized Flows", start: 1.0, end: 1.70, color: "#155e75" },
    { id: "y9", label: "Gladly Lookup", start: 1.80, end: 2.77, color: "#164e63" },
    { id: "y10", label: "Sunny Save Tasks", start: 3.0, end: 4.45, color: "#6366f1", atRisk: true },
    { id: "y11", label: "Sunny Guided Season Recap", start: 3.0, end: 5.0, color: "#7c3aed", atRisk: true },
  ],
};

const DEFAULT_COMMITMENTS = {
  ppcx: {
    "Chelsea":   [true,  true,  true,  true,  true,  true ],
    "Francesco": [true,  true,  true,  true,  true,  true ],
    "Josh":      [true,  false, false, false, false, false],
    "Justin":    [true,  true,  true,  false, false, false],
    "Bryan D":   [true,  true,  true,  false, false, false],
    "Brian W":   [true,  true,  true,  true,  true,  true ],
    "Cory":      [true,  true,  true,  false, false, false],
  },
  mobile: {
    "Mike":   [true, true, true, true, true, true],
    "Megan":  [true, true, true, true, true, true],
    "Josh":   [true, true,  true,  true, true, true],
    "Matt":   [true, "leave", "returning", true, true, true],
  },
  yardai: {
    "Mike":      [true,  true,  true,  true,  true,  true ],
    "Francesco": [true,  true,  true,  true,  true,  true ],
    "Sergio":    [true,  true,  false, false, false, false],
    "James":     [false, true,  true,  false, false, false],
    "Adam":      [false, true,  true,  false, false, false],
    "Maggie":    [false, true,  true,  false, false, false],
  },
};

export const QUESTION_STATUSES = ["Needs discussion", "Being Discussed", "Done"];
export const QUESTION_CATEGORIES = ["strategic", "technical", "resourcing"];

const DEFAULT_QUESTIONS = [
  {
    id: "q-josh-split",
    question: "After that, does Josh stay with Mobile App permanently or shift back to PPCX?",
    detail: "Josh recently moved over to help the Mobile App team. He'll be with Mobile App 75% of the time in March and April (where he can fill in for Matt). After that, does he stay with Mobile App permanently or shift back to the PPCX team? This question will have capacity impacts on each team.",
    teams: ["ppcx", "mobile"],
    status: "Needs discussion",
    category: "resourcing",
  },
  {
    id: "q-sunny-recap",
    question: "Sunny Guided Season Recap — staffing & ownership",
    detail: "Cory and Bryan D are expected to work on this from a BE perspective, but the Yard AI side of this is unknown. We will need to do more discovery to determine the work and then decide if resources from Yard AI need to be allocated here.",
    teams: ["ppcx", "yardai"],
    status: "Needs discussion",
    category: "strategic",
  },
  {
    id: "q-yard-status-reminders",
    question: "Yard Status iteration & reminders — how do we staff the next phase?",
    detail: "Our assumption is that we will need to do additional work once we learn more about the experience. There are probably other things like reminders/nudges that should happen regardless of what we find in the data. How are we planning on staffing that work?",
    teams: ["ppcx"],
    status: "Needs discussion",
    category: "technical",
  },
  {
    id: "q-tech-debt",
    question: "Tech debt prioritization — what gets worked and in what order?",
    detail: "Brian W is the primary owner of tech debt for potentially 6 months. Having an entire BE engineer dedicated to this is significant. What gets prioritized and why needs a decision so this time is used intentionally.",
    teams: ["ppcx"],
    status: "Needs discussion",
    category: "technical",
  },
  {
    id: "q-be-sunny-recap",
    question: "What BE work is needed before Sunny Guided Season Recap can start?",
    detail: "Justin is expected to shift to Sunny Guided Season Recap but the BE prerequisites aren't defined. Needs scoping before capacity can be confirmed.",
    teams: ["ppcx"],
    status: "Needs discussion",
    category: "technical",
  },
  {
    id: "q-ppcx-engineers-recap",
    question: "How many PPCX engineers are needed for Sunny Guided Season Recap, and when?",
    detail: "Justin, Cory, and Bryan D are all question marks in June/July pending this answer. The number of engineers pulled onto this work directly affects how much capacity PPCX has for anything else in Q3.",
    teams: ["ppcx"],
    status: "Needs discussion",
    category: "resourcing",
  },
  {
    id: "q-josh-tweaks",
    question: "What do we want to focus on when Josh has bandwidth for tweaks?",
    detail: "We will have Josh 75% of the time. His ultimate goal will be to monitor for bugs and make sure the app is running as anticipated. If all goes well, we may have some time for basic tweaks. What do we want to focus on at that point?",
    teams: ["mobile"],
    status: "Needs discussion",
    category: "technical",
  },
  {
    id: "q-app-strategy",
    question: "App strategy and sequencing — Yard Status, Acquisition, Sub Management",
    detail: "The executive team has said at different points that Yard Status, Acquisition, and Sub Management all need to be added to the app. There's a larger strategic question about what we want/need the app to be. We could use the executive's help in cascading the overall strategy and providing guidance on sequencing.",
    teams: ["mobile"],
    status: "Needs discussion",
    category: "strategic",
  },
  {
    id: "q-sergio-may",
    question: "What is Sergio focused on during May?",
    detail: "We could either take a big swing (something like Sunny Memories) or use that opportunity to clean up some of our UI.",
    teams: ["yardai"],
    status: "Needs discussion",
    category: "strategic",
  },
];

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && typeof data.range === "object" && typeof data.tracks === "object") return data;
  } catch (_) {}
  return null;
}

function saveStored(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_) {}
}

function ensureCommitmentsLength(commitments, monthCount) {
  if (!commitments) return commitments;
  const out = {};
  for (const [person, arr] of Object.entries(commitments)) {
    if (!Array.isArray(arr)) continue;
    const len = arr.length;
    if (len >= monthCount) out[person] = arr.slice(0, monthCount);
    else out[person] = [...arr, ...Array(monthCount - len).fill(false)];
  }
  return out;
}

const TimelineContext = createContext(null);

export function TimelineProvider({ children }) {
  const [range, setRangeState] = useState(() => {
    const stored = loadStored();
    return stored?.range ?? { months: DEFAULT_MONTHS, year: DEFAULT_YEAR };
  });
  const [tracks, setTracksState] = useState(() => {
    const stored = loadStored();
    return stored?.tracks ?? DEFAULT_TRACKS;
  });
  const [commitments, setCommitmentsState] = useState(() => {
    const stored = loadStored();
    const monthCount = stored?.range?.months?.length ?? 6;
    const raw = stored?.commitments;
    if (!raw || typeof raw !== "object") return DEFAULT_COMMITMENTS;
    return {
      ppcx: ensureCommitmentsLength(raw.ppcx ?? DEFAULT_COMMITMENTS.ppcx, monthCount),
      mobile: ensureCommitmentsLength(raw.mobile ?? DEFAULT_COMMITMENTS.mobile, monthCount),
      yardai: ensureCommitmentsLength(raw.yardai ?? DEFAULT_COMMITMENTS.yardai, monthCount),
    };
  });
  const [questions, setQuestionsState] = useState(() => {
    const stored = loadStored();
    const raw = stored?.questions;
    if (!Array.isArray(raw)) return DEFAULT_QUESTIONS;
    return raw.length ? raw : DEFAULT_QUESTIONS;
  });

  const { isEditor } = useAuth();
  const hasHydratedFromRemote = useRef(false);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetchAppState().then((remote) => {
      if (cancelled || !remote || hasHydratedFromRemote.current) return;
      hasHydratedFromRemote.current = true;
      if (remote.range) setRangeState(remote.range);
      if (remote.tracks) setTracksState(remote.tracks);
      if (remote.commitments) {
        const monthCount = remote.range?.months?.length ?? 6;
        setCommitmentsState({
          ppcx: ensureCommitmentsLength(remote.commitments.ppcx, monthCount) ?? DEFAULT_COMMITMENTS.ppcx,
          mobile: ensureCommitmentsLength(remote.commitments.mobile, monthCount) ?? DEFAULT_COMMITMENTS.mobile,
          yardai: ensureCommitmentsLength(remote.commitments.yardai, monthCount) ?? DEFAULT_COMMITMENTS.yardai,
        });
      }
      if (Array.isArray(remote.questions) && remote.questions.length > 0) setQuestionsState(remote.questions);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    saveStored({ range, tracks, commitments, questions });
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if (isEditor) {
      saveTimeoutRef.current = setTimeout(() => {
        saveTimeoutRef.current = null;
        saveAppState({ range, tracks, commitments, questions });
      }, 1500);
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [range, tracks, commitments, questions, isEditor]);

  const updateRange = useCallback((months, year) => {
    setRangeState((prev) => ({
      months: months ?? prev.months,
      year: year ?? prev.year,
    }));
  }, []);

  const updateTracks = useCallback((teamId, newTracks) => {
    setTracksState((prev) => ({
      ...prev,
      [teamId]: newTracks,
    }));
  }, []);

  const updateTrack = useCallback((teamId, trackId, updates) => {
    setTracksState((prev) => {
      const list = prev[teamId] ?? [];
      const next = list.map((t) =>
        t.id === trackId ? { ...t, ...updates } : t
      );
      return { ...prev, [teamId]: next };
    });
  }, []);

  const addTrack = useCallback((teamId, track) => {
    const id = `${teamId}-${Date.now()}`;
    setTracksState((prev) => ({
      ...prev,
      [teamId]: [...(prev[teamId] ?? []), { ...track, id }],
    }));
    return id;
  }, []);

  const removeTrack = useCallback((teamId, trackId) => {
    setTracksState((prev) => ({
      ...prev,
      [teamId]: (prev[teamId] ?? []).filter((t) => t.id !== trackId),
    }));
  }, []);

  const updateCommitment = useCallback((teamId, personName, monthIndex, value) => {
    setCommitmentsState((prev) => {
      const team = prev[teamId] ?? {};
      const arr = team[personName] ? [...team[personName]] : [];
      while (arr.length <= monthIndex) arr.push(false);
      arr[monthIndex] = value;
      return { ...prev, [teamId]: { ...team, [personName]: arr } };
    });
  }, []);

  const addQuestion = useCallback((q) => {
    const id = `q-${Date.now()}`;
    setQuestionsState((prev) => [...prev, { ...q, id, status: q.status || "Needs discussion", category: q.category || "strategic" }]);
    return id;
  }, []);

  const updateQuestion = useCallback((id, updates) => {
    setQuestionsState((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  }, []);

  const removeQuestion = useCallback((id) => {
    setQuestionsState((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const value = {
    range,
    tracks,
    commitments,
    questions,
    updateRange,
    updateTracks,
    updateTrack,
    updateCommitment,
    addQuestion,
    updateQuestion,
    removeQuestion,
    addTrack,
    removeTrack,
    monthCount: range.months?.length ?? 6,
  };

  return (
    <TimelineContext.Provider value={value}>
      {children}
    </TimelineContext.Provider>
  );
}

export function useTimeline() {
  const ctx = useContext(TimelineContext);
  if (!ctx) throw new Error("useTimeline must be used within TimelineProvider");
  return ctx;
}
