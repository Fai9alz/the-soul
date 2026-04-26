// ─── The Soul — Public Unit Data (Supabase) ───────────────────────────────────
// Single source of truth for the public /soul-hittin listing.
// Fetches directly from `units` WHERE project = 'Soul Hittin'.
// No static data needed — admin changes appear immediately on page refresh.
//
// NOTE: The `units` table has no "type" column.
//       Type is derived from bedrooms + floor (see deriveType below).
//       Studio is indistinguishable from 1 Bedroom without a DB column;
//       add a `unit_type` column to the table to restore that distinction.
// ─────────────────────────────────────────────────────────────────────────────

import { supabase }              from "./supabase";
import type { UnitStatus, UnitType } from "./units";

// Re-export so callers only need one import
export type { UnitStatus, UnitType };

// ── Public unit type ──────────────────────────────────────────────────────────

export interface PublicUnit {
  id:        string;         // Supabase UUID
  name:      string;
  ref:       string;         // reference_code — lower-case form is the URL slug
  type:      UnitType;       // derived from bedrooms + floor
  bedrooms:  number;
  bathrooms: number;
  area:      number;         // sqm
  floor:     number;
  price:     number;         // SAR / year  (annual_price)
  status:    UnitStatus;
  image:     string | null;  // units.image_url — primary-image cache
}

// ── Type derivation ───────────────────────────────────────────────────────────
// Floor ≥ 4 → Penthouse, regardless of bedroom count (handles 3-bed penthouses).
// Bedrooms ≤ 1 → "1 Bedroom" (Studio & 1BR are merged without a type column).

function deriveType(bedrooms: number, floor: number): UnitType {
  if (floor    >= 4)  return "Penthouse";
  if (bedrooms <= 1)  return "1 Bedroom";
  if (bedrooms === 2) return "2 Bedrooms";
  if (bedrooms === 3) return "3 Bedrooms";
  return "Penthouse";           // 4+ bedrooms on lower floors
}

// ── DB row shape ──────────────────────────────────────────────────────────────

interface UnitRow {
  id:             string;
  name:           string | null;
  reference_code: string | null;
  annual_price:   number | null;
  bedrooms:       number | null;
  bathrooms:      number | null;
  area:           number | null;
  floor:          number | null;
  status:         string | null;
  image_url:      string | null;
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

/**
 * Returns all Soul Hittin units directly from Supabase, ordered by
 * reference_code ascending for consistent display order.
 *
 * Throws on DB error — callers are expected to catch and show an error state.
 */
export async function getSoulHittinUnits(): Promise<PublicUnit[]> {
  const { data, error } = await supabase
    .from("units")
    .select(
      "id, name, reference_code, annual_price, bedrooms, bathrooms, area, floor, status, image_url"
    )
    .eq("project", "Soul Hittin")
    .order("reference_code", { ascending: true });

  if (error) throw new Error(error.message);

  return (data as UnitRow[]).map((row): PublicUnit => {
    const beds = row.bedrooms ?? 0;
    const fl   = row.floor    ?? 1;
    return {
      id:        row.id,
      name:      row.name           ?? "–",
      ref:       row.reference_code ?? "",
      type:      deriveType(beds, fl),
      bedrooms:  beds,
      bathrooms: row.bathrooms    ?? 0,
      area:      row.area         ?? 0,
      floor:     fl,
      price:     row.annual_price ?? 0,
      status:    (row.status      ?? "Available") as UnitStatus,
      image:     row.image_url    ?? null,
    };
  });
}
