import { createContext, useContext, useState, useCallback, useEffect } from "react";

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
    "Josh":    [true,  false, false, false, false, false],
    "Justin":  [true,  true,  true,  false, false, false],
    "Bryan D": [true,  true,  true,  false, false, false],
    "Brian W": [true,  true,  true,  true,  true,  true ],
    "Cory":    [true,  true,  true,  false, false, false],
  },
  mobile: {
    "Josh": [true, true,  true,  true, true, true],
    "Matt": [true, "leave", "returning", true, true, true],
  },
  yardai: {
    "Sergio": [true,  true,  false, false, false, false],
    "James":  [false, true,  true,  false, false, false],
    "Adam":   [false, true,  true,  false, false, false],
    "Maggie": [false, true,  true,  false, false, false],
  },
};

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

  useEffect(() => {
    saveStored({ range, tracks, commitments });
  }, [range, tracks, commitments]);

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

  const value = {
    range,
    tracks,
    commitments,
    updateRange,
    updateTracks,
    updateTrack,
    updateCommitment,
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
