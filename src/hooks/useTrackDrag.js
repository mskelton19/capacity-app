import { useState, useCallback, useEffect, useRef } from "react";

function getRowIndexAtY(rowRefs, clientY) {
  if (!rowRefs?.current || typeof clientY !== "number") return null;
  for (let ri = 0; ri < rowRefs.current.length; ri++) {
    const el = rowRefs.current[ri];
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (clientY >= rect.top && clientY <= rect.bottom) return ri;
  }
  return null;
}

export function useTrackDrag(timelineStripRef, monthCount, updateTrack, onMouseUp, rowRefs) {
  const [dragState, setDragState] = useState(null);
  const didDragRef = useRef(false);

  const getMonthPosition = useCallback(
    (clientX) => {
      const el = timelineStripRef?.current;
      if (!el || !monthCount) return 0;
      const rect = el.getBoundingClientRect();
      const t = (clientX - rect.left) / rect.width;
      return Math.max(0, Math.min(1, t)) * monthCount;
    },
    [timelineStripRef, monthCount]
  );

  const handlePointerDown = useCallback(
    (track, teamId, e) => {
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const monthPos = getMonthPosition(clientX);
      const offsetInMonths = monthPos - track.start;
      const duration = track.end - track.start;
      didDragRef.current = false;
      setDragState({ track, teamId, offsetInMonths, duration });
    },
    [getMonthPosition]
  );

  useEffect(() => {
    if (!dragState) return;
    const { track, teamId, offsetInMonths, duration } = dragState;

    const handleMove = (e) => {
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const monthPos = getMonthPosition(clientX);
      let newStart = monthPos - offsetInMonths;
      newStart = Math.max(0, Math.min(monthCount - duration, newStart));
      const newEnd = newStart + duration;
      didDragRef.current = true;
      updateTrack(teamId, track.id, { start: newStart, end: newEnd });
    };

    const handleUp = (e) => {
      const clientY = e?.clientY ?? e?.changedTouches?.[0]?.clientY;
      const targetRowIndex = getRowIndexAtY(rowRefs, clientY);
      if (didDragRef.current && targetRowIndex !== null) {
        updateTrack(teamId, track.id, { rowIndex: targetRowIndex });
      }
      if (onMouseUp) onMouseUp(dragState.track, didDragRef.current);
      setDragState(null);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove, { passive: true });
    window.addEventListener("touchend", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [dragState, monthCount, getMonthPosition, updateTrack, onMouseUp, rowRefs]);

  return {
    draggingTrackId: dragState?.track?.id ?? null,
    handleBarPointerDown: handlePointerDown,
  };
}
