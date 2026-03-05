/**
 * Build rows for the Gantt: first assign by overlap, then apply user rowIndex overrides.
 * Returns an array of rows (each row is an array of tracks).
 */
export function buildRowsWithOverrides(tracks) {
  if (!tracks?.length) return [];

  const initialRows = [];
  const trackToRow = new Map();

  tracks.forEach((track) => {
    let placed = false;
    for (let ri = 0; ri < initialRows.length; ri++) {
      const row = initialRows[ri];
      if (row.every((r) => r.end <= track.start + 0.05 || r.start >= track.end - 0.05)) {
        row.push(track);
        trackToRow.set(track, ri);
        placed = true;
        break;
      }
    }
    if (!placed) {
      initialRows.push([track]);
      trackToRow.set(track, initialRows.length - 1);
    }
  });

  const newRows = {};
  initialRows.forEach((row, ri) => {
    newRows[ri] = row.slice();
  });

  tracks.forEach((track) => {
    if (track.rowIndex === undefined) return;
    const oldRow = trackToRow.get(track);
    if (oldRow === undefined) return;
    newRows[oldRow] = newRows[oldRow].filter((t) => t !== track);
    newRows[track.rowIndex] = newRows[track.rowIndex] || [];
    newRows[track.rowIndex].push(track);
  });

  const rowIndices = Object.keys(newRows)
    .map(Number)
    .filter((ri) => newRows[ri].length > 0)
    .sort((a, b) => a - b);

  return rowIndices.map((ri) => newRows[ri]);
}
