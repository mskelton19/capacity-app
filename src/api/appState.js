import { apiFetch } from "../lib/api";

export async function fetchAppState() {
  try {
    const res = await apiFetch("/api/state");
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || typeof data !== "object") return null;
    if (!data.range || !data.tracks) return null;
    return data;
  } catch (_) {
    return null;
  }
}

export async function saveAppState(state) {
  try {
    const res = await apiFetch("/api/state", {
      method: "PUT",
      body: JSON.stringify(state),
    });
    return res.ok;
  } catch (_) {
    return false;
  }
}
