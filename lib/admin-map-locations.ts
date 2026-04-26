// ─── The Soul — Admin Map Locations (Supabase) ────────────────────────────────
// Supabase table: public.map_locations
//
// Columns (exact names):
//   id           UUID        PRIMARY KEY DEFAULT gen_random_uuid()
//   name         TEXT        NOT NULL
//   description  TEXT        NOT NULL DEFAULT ''
//   category     TEXT        NOT NULL DEFAULT 'landmark'
//   latitude     FLOAT8      NOT NULL
//   longitude    FLOAT8      NOT NULL
//   project      TEXT        NOT NULL DEFAULT 'Both'
//   image_url    TEXT        NOT NULL DEFAULT ''
//   created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from "./supabase";

// ── Constants ────────────────────────────────────────────────────────────────

const TABLE = "map_locations";

// ── Types ─────────────────────────────────────────────────────────────────────

export type Category       = "project" | "school" | "landmark" | "business" | "shopping" | "transit";
export type RelatedProject = "Soul Hittin" | "Soul Al Wadi" | "Both" | "None";

// JS-friendly interface used by the UI.
export interface MapLocation {
  id:             string;
  name:           string;
  category:       Category;
  lat:            number;
  lng:            number;
  relatedProject: RelatedProject;
  description:    string;
  image:          string;
}

// Exact DB row shape — matches public.map_locations.
interface MapLocationRow {
  id:          string;
  name:        string;
  description: string;
  category:    string;
  latitude:    number;
  longitude:   number;
  project:     string;
  image_url:   string;
  created_at?: string;
}

// DB row → JS object
function rowToLocation(row: MapLocationRow): MapLocation {
  return {
    id:             row.id,
    name:           row.name,
    description:    row.description ?? "",
    category:       (row.category ?? "landmark") as Category,
    lat:            row.latitude,
    lng:            row.longitude,
    relatedProject: (row.project ?? "Both") as RelatedProject,
    image:          row.image_url ?? "",
  };
}

// JS object → DB row payload (used for insert/update)
// Applies safe defaults so NOT NULL columns never receive null/undefined.
function locationToPayload(loc: Omit<MapLocation, "id">) {
  return {
    name:        (loc.name ?? "").trim(),
    description: loc.description ?? "",
    category:    (loc.category ?? "landmark") as Category,
    latitude:    Number.isFinite(loc.lat) ? loc.lat : 0,
    longitude:   Number.isFinite(loc.lng) ? loc.lng : 0,
    project:     (loc.relatedProject ?? "Both") as RelatedProject,
    image_url:   loc.image ?? "",
  };
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getMapLocations(): Promise<MapLocation[]> {
  console.log("[map_locations] SELECT from table:", TABLE);
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[map_locations] SELECT error — full object:", error);
    console.error("[map_locations] SELECT error details:", {
      message: error.message,
      details: error.details,
      hint:    error.hint,
      code:    error.code,
    });
    throw new Error(error.message);
  }

  console.log("[map_locations] SELECT returned", (data ?? []).length, "rows");
  return (data as MapLocationRow[]).map(rowToLocation);
}

// ── Insert ────────────────────────────────────────────────────────────────────

export async function insertMapLocation(
  loc: Omit<MapLocation, "id">,
): Promise<MapLocation> {
  const payload = locationToPayload(loc);
  console.log("[map_locations] INSERT into table:", TABLE);
  console.log("[map_locations] INSERT payload:", payload);

  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("[map_locations] INSERT error — full object:", error);
    console.error("[map_locations] INSERT error JSON:", JSON.stringify(error));
    console.error(
      "[map_locations] INSERT error fields — message:",
      error.message,
      "details:",
      error.details,
      "hint:",
      error.hint,
      "code:",
      error.code,
    );
    throw new Error(error.message);
  }

  console.log("[map_locations] INSERT returned row:", data);
  return rowToLocation(data as MapLocationRow);
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updateMapLocation(
  id:  string,
  loc: Omit<MapLocation, "id">,
): Promise<MapLocation> {
  const payload = locationToPayload(loc);
  console.log("[map_locations] UPDATE table:", TABLE, "id:", id);
  console.log("[map_locations] UPDATE payload:", payload);

  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[map_locations] UPDATE error — full object:", error);
    console.error("[map_locations] UPDATE error details:", {
      message: error.message,
      details: error.details,
      hint:    error.hint,
      code:    error.code,
    });
    throw new Error(error.message);
  }

  console.log("[map_locations] UPDATE returned row:", data);
  return rowToLocation(data as MapLocationRow);
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteMapLocation(id: string): Promise<void> {
  console.log("[map_locations] DELETE from table:", TABLE, "id:", id);
  const { error } = await supabase.from(TABLE).delete().eq("id", id);

  if (error) {
    console.error("[map_locations] DELETE error — full object:", error);
    console.error("[map_locations] DELETE error details:", {
      message: error.message,
      details: error.details,
      hint:    error.hint,
      code:    error.code,
    });
    throw new Error(error.message);
  }

  console.log("[map_locations] DELETE succeeded for id:", id);
}
