import { useState, useCallback, useEffect, useRef } from "react";

/**
 * Returns the row index where the track should be dropped (0 to rowCount).
 * Top half of a row -> drop in that row; bottom half -> insert below (next row).
 * Below the last row -> append (rowCount).
 */
function getDropRowIndexAtY(rowRefs, clientY) {
  if (!rowRefs?.current || typeof clientY !== "number") return null;
  const rows = rowRefs.current;
  for (let ri = 0; ri < rows.length; ri++) {
    const el = rows[ri];
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (clientY < rect.top) return ri;
    if (clientY <= rect.bottom) {
      const mid = rect.top + rect.height / 2;
      return clientY < mid ? ri : ri + 1;
    }
  }
  return rows.length;
}

const MIN_BAR_DURATION = 0.05;

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

  const VERTICAL_MOVE_THRESHOLD_PX = 12;

  const handlePointerDown = useCallback(
    (track, teamId, e, currentRowIndex = 0) => {
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;
      const monthPos = getMonthPosition(clientX);
      const offsetInMonths = monthPos - track.start;
      const duration = track.end - track.start;
      didDragRef.current = false;
      setDragState({ track, teamId, offsetInMonths, duration, mode: "move", initialRowIndex: currentRowIndex, startClientY: clientY });
    },
    [getMonthPosition]
  );

  const handleResizeLeftPointerDown = useCallback(
    (track, teamId, e) => {
      e.preventDefault();
      e.stopPropagation();
      didDragRef.current = false;
      setDragState({ track, teamId, mode: "resize-left" });
    },
    []
  );

  const handleResizeRightPointerDown = useCallback(
    (track, teamId, e) => {
      e.preventDefault();
      e.stopPropagation();
      didDragRef.current = false;
      setDragState({ track, teamId, mode: "resize-right" });
    },
    []
  );

  useEffect(() => {
    if (!dragState) return;
    const { track, teamId, mode } = dragState;

    const handleMove = (e) => {
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const monthPos = getMonthPosition(clientX);
      if (mode === "move") {
        const { offsetInMonths, duration } = dragState;
        let newStart = monthPos - offsetInMonths;
        newStart = Math.max(0, Math.min(monthCount - duration, newStart));
        const newEnd = newStart + duration;
        didDragRef.current = true;
        updateTrack(teamId, track.id, { start: newStart, end: newEnd });
      } else if (mode === "resize-left") {
        const newStart = Math.max(0, Math.min(monthPos, track.end - MIN_BAR_DURATION));
        didDragRef.current = true;
        updateTrack(teamId, track.id, { start: newStart });
      } else if (mode === "resize-right") {
        const newEnd = Math.max(track.start + MIN_BAR_DURATION, Math.min(monthCount, monthPos));
        didDragRef.current = true;
        updateTrack(teamId, track.id, { end: newEnd });
      }
    };

    const handleUp = (e) => {
      if (mode === "move") {
        const clientY = e?.clientY ?? e?.changedTouches?.[0]?.clientY;
        const startY = dragState.startClientY;
        const verticalMoved = typeof clientY === "number" && typeof startY === "number" && Math.abs(clientY - startY) > VERTICAL_MOVE_THRESHOLD_PX;
        const targetRowIndex = getDropRowIndexAtY(rowRefs, clientY);
        const initialRowIndex = dragState.initialRowIndex ?? 0;
        if (didDragRef.current && verticalMoved && targetRowIndex !== null && targetRowIndex !== initialRowIndex) {
          updateTrack(teamId, track.id, { rowIndex: targetRowIndex });
        }
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
    resizingTrackId: dragState?.mode?.startsWith("resize") ? dragState?.track?.id ?? null : null,
    handleBarPointerDown: handlePointerDown,
    handleResizeLeftPointerDown: handleResizeLeftPointerDown,
    handleResizeRightPointerDown: handleResizeRightPointerDown,
  };
}
