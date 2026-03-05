import { supabase, isSupabaseConfigured } from "../lib/supabase";

const ROW_ID = "default";

export async function fetchAppState() {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from("app_state")
      .select("data")
      .eq("id", ROW_ID)
      .maybeSingle();
    if (error) return null;
    const payload = data?.data;
    if (!payload || typeof payload !== "object") return null;
    if (!payload.range || !payload.tracks) return null;
    return payload;
  } catch (_) {
    return null;
  }
}

export async function saveAppState(state) {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase
      .from("app_state")
      .upsert(
        { id: ROW_ID, data: state, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      );
    return !error;
  } catch (_) {
    return false;
  }
}
